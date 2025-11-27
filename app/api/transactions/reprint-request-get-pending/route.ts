import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/constants';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || '';
    const body = await req.json();

    const response = await axios.get(
      `${BACKEND_URL}/api/transactions/reprint-request-get-pending`,
      {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      }
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return handleApiError(error);
  }
}
