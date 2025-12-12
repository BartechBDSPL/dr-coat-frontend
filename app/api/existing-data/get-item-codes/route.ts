import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || '';

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token is required' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/master/existing-data/get-item-codes`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        cache: 'no-store',
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch item codes' },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json(data, { status: 200 });
    nextResponse.headers.set(
      'Cache-Control',
      'no-store, no-cache, must-revalidate, proxy-revalidate'
    );
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');
    nextResponse.headers.set('Surrogate-Control', 'no-store');
    return nextResponse;
  } catch (error: any) {
    console.error('Error fetching item codes:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
