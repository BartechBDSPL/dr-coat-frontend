import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/constants';
import { handleApiError } from '@/lib/api-error-handler';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || '';

    const response = await axios.get(
      `${BACKEND_URL}/api/rm-dashboard/location-wise-item-qty`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return handleApiError(error);
  }
}
