import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { BACKEND_URL } from '@/lib/constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { production_order_no, item_code, lot_no } = body;

    if (!production_order_no || !item_code || !lot_no) {
      return NextResponse.json(
        {
          error:
            'Production order number, item code, and lot number are required',
        },
        { status: 400 }
      );
    }

    const token = request.cookies.get('token')?.value || '';

    const response = await axios.post(
      `${BACKEND_URL}/api/transactions/production-order-find-sr-no`,
      {
        production_order_no: production_order_no.trim(),
        item_code: item_code.trim(),
        lot_no: lot_no.trim(),
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('Error fetching serial number:', error);

    if (error.response) {
      return NextResponse.json(
        {
          error: error.response.data?.error || 'Failed to fetch serial number',
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
