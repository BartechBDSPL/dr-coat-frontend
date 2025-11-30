import { NextResponse } from 'next/server';

export function handleApiError(error: any): NextResponse {
  if (error.response) {
    return NextResponse.json(error.response.data || { error: error.message }, {
      status: error.response.status,
    });
  }

  return NextResponse.json(
    { error: error.message || 'Internal server error' },
    { status: 500 }
  );
}
