import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/constants';
import { handleApiError } from '@/lib/api-error-handler';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || '';
    const response = await axios.get(
      `${BACKEND_URL}/api/master/all-uom-details`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return handleApiError(error);
  }
}
