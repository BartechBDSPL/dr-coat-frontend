import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/constants';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || '';
    const formData = await req.formData();

    if (!token) {
      return NextResponse.json(
        { Status: 'F', Message: 'Authorization token is required' },
        { status: 401 }
      );
    }

    const response = await fetch(
      `${BACKEND_URL}/api/master/existing-data/upload-excel`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          Status: 'F',
          Message: data.Message || data.error || 'Failed to upload excel',
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error uploading excel:', error);
    return NextResponse.json(
      { Status: 'F', Message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
