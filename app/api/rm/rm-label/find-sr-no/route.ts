import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { BACKEND_URL } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { item_code, lot_no } = body;

    if (!item_code || !lot_no) {
      return NextResponse.json(
        { error: 'item_code and lot_no are required' },
        { status: 400 }
      );
    }

    const token = request.cookies.get('token')?.value || '';

    const response = await axios.post(
      `${BACKEND_URL}/api/rm/rm-label/find-sr-no`,
      { item_code, lot_no },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error finding SR number:', error);

    if (error.response) {
      return NextResponse.json(
        { error: error.response.data?.error || 'Failed to find SR number' },
        { status: error.response.status }
      );
    }

    return NextResponse.json(
      { error: 'Failed to find SR number' },
      { status: 500 }
    );
  }
}
