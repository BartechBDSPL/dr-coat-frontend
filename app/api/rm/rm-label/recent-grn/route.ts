import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { BACKEND_URL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value || '';

    const response = await axios.get(
      `${BACKEND_URL}/api/rm/rm-label/recent-grn`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching recent GRNs:', error);

    if (error.response) {
      return NextResponse.json(
        { error: error.response.data?.error || 'Failed to get recent GRNs' },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to get recent GRNs' },
      { status: 500 }
    );
  }
}
