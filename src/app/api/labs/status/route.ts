import { NextRequest, NextResponse } from 'next/server';
import { dockerService } from '@/lib/docker-service';
import { getAuthUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Get user from httpOnly cookie
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Initialize docker service if not already done
    await dockerService.initializeFromDatabase();

    // Get user's active containers
    const activeContainers = await dockerService.getUserActiveContainers(user.user_id);

    return NextResponse.json({
      success: true,
      data: {
        activeContainers: activeContainers.map(container => ({
          containerId: container.containerId,
          labType: container.labType,
          port: container.port,
          url: `http://localhost:${container.port}`,
          status: container.status,
          createdAt: container.createdAt
        }))
      }
    });

  } catch (error) {
    console.error('Error getting container status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
