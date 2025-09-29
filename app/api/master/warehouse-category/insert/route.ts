import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/constants';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || '';
    const body = await req.json();
    const response = await axios.post(
      `${BACKEND_URL}/api/master/insert-warehouse-category`,
      body,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return handleApiError(error);
  }
}
