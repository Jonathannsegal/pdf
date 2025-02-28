// app/api/unity-status/route.ts
import { NextResponse } from 'next/server';

const UNITY_URL = 'http://localhost:5000/';

export async function GET() {
  try {
    const response = await fetch(UNITY_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add a timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      throw new Error('Unity connection failed');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unity health check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Could not connect to Unity',
        api_connected: false,
        web_connected: false,
      },
      { status: 500 }
    );
  }
}