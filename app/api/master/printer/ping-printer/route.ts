import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/constants';

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const ip = searchParams.get('ip');

    if (!ip) {
      return NextResponse.json(
        { error: 'IP address is required' },
        { status: 400 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/master/ping-printer?ip=${ip}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          authorization: token,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to ping printer' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error pinging printer:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
