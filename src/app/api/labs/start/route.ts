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
    const { labType } = body;

    if (!labType || (labType !== 'xss' && labType !== 'csrf')) {
      return NextResponse.json(
        { success: false, error: 'Invalid lab type. Must be "xss" or "csrf"' },
        { status: 400 }
      );
    }

    // Initialize docker service if not already done
    await dockerService.initializeFromDatabase();

    // Start the lab container
    const result = await dockerService.startLabContainer(user.user_id, labType);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `${labType.toUpperCase()} lab started successfully`,
        data: {
          containerId: result.containerId,
          port: result.port,
          url: result.url,
          labType
        }
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error starting lab container:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
