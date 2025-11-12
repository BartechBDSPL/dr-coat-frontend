import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { BACKEND_URL } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || '';

    const response = await axios.post(
      `${BACKEND_URL}/api/transactions/production-order-get-recent`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching recent production orders:', error);

    if (error.response) {
      return NextResponse.json(
        {
          error:
            error.response.data?.error ||
            'Failed to fetch recent production orders',
        },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
