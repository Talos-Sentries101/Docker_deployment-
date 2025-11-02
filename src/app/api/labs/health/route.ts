import { NextResponse } from 'next/server';
import { dockerService } from '@/lib/docker-service';

export async function GET() {
  try {
    const dockerAvailable = await dockerService.isDockerAvailable();
    
    return NextResponse.json({
      success: true,
      data: {
        dockerAvailable,
        message: dockerAvailable 
          ? 'Docker service is available and ready'
          : 'Docker service is not available. Please ensure Docker Desktop is running.'
      }
    });

  } catch (error) {
    console.error('Error checking Docker health:', error);
    return NextResponse.json({
      success: false,
      data: {
        dockerAvailable: false,
        message: 'Error checking Docker service availability'
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
