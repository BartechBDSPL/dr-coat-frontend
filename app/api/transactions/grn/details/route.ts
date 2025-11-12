import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { BACKEND_URL } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { grn_no } = body;

    if (!grn_no) {
      return NextResponse.json(
        { error: 'GRN number is required' },
        { status: 400 }
      );
    }

    const token = request.cookies.get('token')?.value || '';

    const response = await axios.post(
      `${BACKEND_URL}/api/transactions/grn/details`,
      { grn_no: grn_no.trim() },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching GRN details:', error);

    if (error.response) {
      return NextResponse.json(
        { error: error.response.data?.error || 'Failed to fetch GRN details' },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
