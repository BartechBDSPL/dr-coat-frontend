import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { BACKEND_URL } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = request.cookies.get('token')?.value || '';

    const response = await axios.post(
      `${BACKEND_URL}/api/rm/rm-label/insert`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error inserting RM label printing:', error);

    if (error.response) {
      return NextResponse.json(
        {
          error:
            error.response.data?.error || 'Failed to insert RM label printing',
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to insert RM label printing' },
      { status: 500 }
    );
  }
}
