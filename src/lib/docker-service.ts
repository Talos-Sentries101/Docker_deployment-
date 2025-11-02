import Docker from 'dockerode';
import { Pool } from 'pg';
import path from 'path';

const docker = new Docker();

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD,
  database: 'letushack_db'
});

export interface ContainerInfo {
  containerId: string;
  userId: string;
  labType: 'xss' | 'csrf';
  port: number;
  status: 'running' | 'stopped' | 'error';
  createdAt: Date;
}

export class DockerService {
  private static instance: DockerService;
  private activeContainers: Map<string, ContainerInfo> = new Map();
  private dockerAvailable: boolean = false;

  private constructor() {
    this.checkDockerAvailability();
  }

  public static getInstance(): DockerService {
    if (!DockerService.instance) {
      DockerService.instance = new DockerService();
    }
    return DockerService.instance;
  }

  private async checkDockerAvailability(): Promise<void> {
    try {
      await docker.ping();
      this.dockerAvailable = true;
      console.log('Docker connection established');
    } catch (error) {
      this.dockerAvailable = false;
      console.warn('Docker is not available:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  public async isDockerAvailable(): Promise<boolean> {
    if (!this.dockerAvailable) {
      await this.checkDockerAvailability();
    }
    return this.dockerAvailable;
  }

  private sanitizeContainerName(userId: string, labType: string): string {
    // Docker container names can only contain [a-zA-Z0-9][a-zA-Z0-9_.-]
    // Replace invalid characters with underscores and ensure it starts with alphanumeric
    const sanitizedUserId = userId
      .replace(/[^a-zA-Z0-9_.-]/g, '_') // Replace invalid chars with underscore
      .replace(/^[^a-zA-Z0-9]/, 'u') // Ensure starts with alphanumeric
      .substring(0, 20); // Limit length to keep container name reasonable
    
    const timestamp = Date.now();
    return `${labType}_${sanitizedUserId}_${timestamp}`;
  }

  private async getAvailablePort(): Promise<number> {
    // Start from port 3001 and find the next available port
    let port = 3001;
    const usedPorts = Array.from(this.activeContainers.values()).map(c => c.port);
    
    while (usedPorts.includes(port)) {
      port++;
    }
    
    return port;
  }

  private getImageName(labType: 'xss' | 'csrf'): string {
    return labType === 'xss' ? 'xss_lab' : 'csrf_lab';
  }

  private async verifyImageExists(imageName: string): Promise<boolean> {
    try {
      await docker.getImage(imageName).inspect();
      return true;
    } catch (error) {
      return false;
    }
  }

  private async stopUserContainers(userId: string): Promise<void> {
    const userContainers = Array.from(this.activeContainers.entries())
      .filter(([_, info]) => info.userId === userId);

    for (const [containerId, info] of userContainers) {
      try {
        const container = docker.getContainer(containerId);
        await container.stop();
        await container.remove();
        this.activeContainers.delete(containerId);
        console.log(`Stopped and removed container ${containerId} for user ${userId}`);
      } catch (error) {
        console.error(`Error stopping container ${containerId}:`, error);
        // Remove from our tracking even if stop failed
        this.activeContainers.delete(containerId);
      }
    }
  }

  public async startLabContainer(userId: string, labType: 'xss' | 'csrf'): Promise<{
    success: boolean;
    containerId?: string;
    port?: number;
    url?: string;
    error?: string;
  }> {
    try {
      // Check if Docker is available
      const dockerAvailable = await this.isDockerAvailable();
      if (!dockerAvailable) {
        return {
          success: false,
          error: 'Docker is not available. Please ensure Docker Desktop is running and try again.'
        };
      }

      // Enforce single container rule - stop any existing containers for this user
      await this.stopUserContainers(userId);

      // Get static image name
      const imageName = this.getImageName(labType);
      
      // Verify image exists
      const imageExists = await this.verifyImageExists(imageName);
      if (!imageExists) {
        return {
          success: false,
          error: `Docker image '${imageName}' not found. Please build the image first using: docker build -t ${imageName} <path-to-dockerfile>`
        };
      }
      
      // Get available port
      const port = await this.getAvailablePort();

      // Create and start container
      const containerName = this.sanitizeContainerName(userId, labType);
      console.log(`Creating container with name: ${containerName} for user: ${userId}`);
      
      const container = await docker.createContainer({
        Image: imageName,
        name: containerName,
        ExposedPorts: {
          '80/tcp': {}
        },
        HostConfig: {
          PortBindings: {
            '80/tcp': [{ HostPort: port.toString() }]
          },
          AutoRemove: true
        }
      });

      await container.start();
      
      const containerInfo: ContainerInfo = {
        containerId: container.id,
        userId,
        labType,
        port,
        status: 'running',
        createdAt: new Date()
      };

      this.activeContainers.set(container.id, containerInfo);

      // Store in database for persistence
      await this.storeContainerInfo(containerInfo);

      return {
        success: true,
        containerId: container.id,
        port,
        url: `http://localhost:${port}`
      };

    } catch (error) {
      console.error(`Error starting ${labType} container for user ${userId}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  public async stopLabContainer(userId: string, containerId?: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      if (containerId) {
        // Stop specific container
        const container = docker.getContainer(containerId);
        await container.stop();
        await container.remove();
        this.activeContainers.delete(containerId);
        await this.removeContainerInfo(containerId);
      } else {
        // Stop all containers for user
        await this.stopUserContainers(userId);
        await this.removeUserContainers(userId);
      }

      return { success: true };
    } catch (error) {
      console.error(`Error stopping container:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  public async getUserActiveContainers(userId: string): Promise<ContainerInfo[]> {
    return Array.from(this.activeContainers.values())
      .filter(info => info.userId === userId);
  }

  public async getAllActiveContainers(): Promise<ContainerInfo[]> {
    return Array.from(this.activeContainers.values());
  }

  private async storeContainerInfo(info: ContainerInfo): Promise<void> {
    try {
      await pool.query(`
        INSERT INTO active_containers (container_id, user_id, lab_type, port, status, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (container_id) DO UPDATE SET
          status = EXCLUDED.status,
          port = EXCLUDED.port
      `, [info.containerId, info.userId, info.labType, info.port, info.status, info.createdAt]);
    } catch (error) {
      console.error('Error storing container info:', error);
    }
  }

  private async removeContainerInfo(containerId: string): Promise<void> {
    try {
      await pool.query('DELETE FROM active_containers WHERE container_id = $1', [containerId]);
    } catch (error) {
      console.error('Error removing container info:', error);
    }
  }

  private async removeUserContainers(userId: string): Promise<void> {
    try {
      await pool.query('DELETE FROM active_containers WHERE user_id = $1', [userId]);
    } catch (error) {
      console.error('Error removing user containers:', error);
    }
  }

  public async initializeFromDatabase(): Promise<void> {
    try {
      // Create table if it doesn't exist
      await pool.query(`
        CREATE TABLE IF NOT EXISTS active_containers (
          container_id VARCHAR(255) PRIMARY KEY,
          user_id VARCHAR(255) NOT NULL,
          lab_type VARCHAR(10) NOT NULL,
          port INTEGER NOT NULL,
          status VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Load existing containers from database
      const result = await pool.query('SELECT * FROM active_containers');
      
      for (const row of result.rows) {
        const containerInfo: ContainerInfo = {
          containerId: row.container_id,
          userId: row.user_id,
          labType: row.lab_type,
          port: row.port,
          status: row.status,
          createdAt: new Date(row.created_at)
        };

        // Verify container is still running
        try {
          const container = docker.getContainer(row.container_id);
          const inspect = await container.inspect();
          
          if (inspect.State.Running) {
            this.activeContainers.set(row.container_id, containerInfo);
          } else {
            // Container is not running, remove from database
            await this.removeContainerInfo(row.container_id);
          }
        } catch (error) {
          // Container doesn't exist, remove from database
          await this.removeContainerInfo(row.container_id);
        }
      }

      console.log(`Initialized Docker service with ${this.activeContainers.size} active containers`);
    } catch (error) {
      console.error('Error initializing Docker service:', error);
    }
  }
}

export const dockerService = DockerService.getInstance();
