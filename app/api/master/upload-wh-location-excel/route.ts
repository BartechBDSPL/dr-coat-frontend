import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { BACKEND_URL } from '@/lib/constants';
import { handleApiError } from '@/lib/api-error-handler';

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('token')?.value || '';
    const formData = await req.formData();

    const backendFormData = new FormData();
    const excelFile = formData.get('excelFile') as File;
    const username = formData.get('username') as string;

    if (excelFile) {
      backendFormData.append('excelFile', excelFile);
    }
    if (username) {
      backendFormData.append('username', username);
    }

    const response = await axios.post(
      `${BACKEND_URL}/api/master/upload-wh-location-excel`,
      backendFormData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return NextResponse.json(response.data);
  } catch (error: any) {
    return handleApiError(error);
  }
}
