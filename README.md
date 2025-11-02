# Docker Labs Setup

This document explains the Docker container management system for XSS and CSRF challenge labs.

## Overview

The system uses Dockerode to manage Docker containers for security challenge labs. Each user can have only one active container at a time, and containers are automatically managed through the web interface.

## Features

- **Single Container Rule**: Each user can only have one active container at any given time
- **Automatic Container Management**: Containers are automatically started, stopped, and cleaned up
- **Lab Isolation**: XSS and CSRF labs run in separate, isolated Docker containers
- **Port Management**: Dynamic port allocation to avoid conflicts
- **Persistent Tracking**: Container state is tracked in the database

## API Endpoints

### Start Lab Container
```
POST /api/labs/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "labType": "xss" | "csrf"
}
```

### Stop Lab Container
```
POST /api/labs/stop
Authorization: Bearer <token>
Content-Type: application/json

{
  "containerId": "optional-container-id"
}
```

### Get Container Status
```
GET /api/labs/status
Authorization: Bearer <token>
```

## Frontend Integration

The frontend should call these endpoints when users click:
- **"Start XSS Challenge"** → POST to `/api/labs/start` with `{"labType": "xss"}`
- **"Start CSRF Challenge"** → POST to `/api/labs/start` with `{"labType": "csrf"}`
- **"Stop Challenge"** → POST to `/api/labs/stop`

## Container Management

### Automatic Features
- **Single Container Enforcement**: Starting a new lab automatically stops any existing containers for that user
- **Port Allocation**: Containers are assigned available ports starting from 3001
- **Auto-cleanup**: Containers are set to auto-remove when stopped
- **Health Monitoring**: Container status is tracked and verified
- **Safe Naming**: User IDs are sanitized to comply with Docker naming requirements

### Manual Management
```bash
# Test Docker setup
npm run test:docker

# Clean up all lab containers
npm run cleanup:containers
```

## Database Schema

The system creates an `active_containers` table:
```sql
CREATE TABLE active_containers (
  container_id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  lab_type VARCHAR(10) NOT NULL,
  port INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Docker Images

The system uses two pre-built static Docker images:
- `xss_lab` - XSS challenge lab image
- `csrf_lab` - CSRF challenge lab image

**Important**: You must build these images manually before using the system:
```bash
# Build XSS lab image
docker build -t xss_lab Docker_labs/XSS_docker/

# Build CSRF lab image  
docker build -t csrf_lab Docker_labs/CSRF_docker-main/
```

## Setup Instructions

1. **Install dependencies:** `npm install`
2. **Start Docker Desktop** (required for container operations)
3. **Build required Docker images:**
   ```bash
   docker build -t xss_lab Docker_labs/XSS_docker/
   docker build -t csrf_lab Docker_labs/CSRF_docker-main/
   ```
4. **Test setup:** `npm run test:docker`
5. **Start development:** `npm run dev`

## Security Considerations

- Containers run with limited privileges
- Each container is isolated from others
- Automatic cleanup prevents resource exhaustion
- Port binding is restricted to localhost
- User authentication is required for all operations

## Troubleshooting

### Common Issues

1. **Docker not running**: Ensure Docker Desktop is running
2. **Port conflicts**: The system automatically handles port allocation
3. **Build failures**: Check Dockerfile syntax in lab directories
4. **Permission errors**: Ensure Docker daemon is accessible

### Debugging Commands

```bash
# Test Docker connection and build images
npm run test:docker

# View active containers
docker ps

# Clean up everything
npm run cleanup:containers

# View Docker logs
docker logs <container-id>
```

## Development Notes

- The `DockerService` class implements the singleton pattern
- Container state is synchronized between memory and database
- Images are built on-demand if they don't exist
- The system gracefully handles Docker daemon disconnections
