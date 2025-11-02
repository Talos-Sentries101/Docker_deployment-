import { NextRequest, NextResponse } from 'next/server';
import { dockerService } from '@/lib/docker-service';
import { getAuthUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Get user from httpOnly cookie
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { containerId } = body;

    // Initialize docker service if not already done
    await dockerService.initializeFromDatabase();

    // Stop the lab container(s)
    const result = await dockerService.stopLabContainer(user.user_id, containerId);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: containerId 
          ? 'Container stopped successfully' 
          : 'All user containers stopped successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error stopping lab container:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
