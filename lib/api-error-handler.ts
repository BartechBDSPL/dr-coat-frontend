import { NextResponse } from 'next/server';

/**
 * Handles API errors and forwards the correct status code and response
 * @param error - The error object from axios or other sources
 * @returns NextResponse with appropriate status code and error message
 */
export function handleApiError(error: any): NextResponse {
  // If it's an axios error with a response from the backend
  if (error.response) {
    return NextResponse.json(error.response.data || { error: error.message }, {
      status: error.response.status,
    });
  }

  // If it's a network error or other error without response
  return NextResponse.json(
    { error: error.message || 'Internal server error' },
    { status: 500 }
  );
}
