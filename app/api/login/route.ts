import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables manually for development only
if (process.env.NODE_ENV === 'development' && !process.env.ADMIN_PASSWORD_HASH) {
  try {
    const envPath = join(process.cwd(), '.env.local');
    const envContent = readFileSync(envPath, 'utf8');
    const envLines = envContent.split('\n');
    
    for (const line of envLines) {
      const [key, ...valueParts] = line.split('=');
      if (key === 'ADMIN_PASSWORD_HASH' && valueParts.length > 0) {
        process.env.ADMIN_PASSWORD_HASH = valueParts.join('=').trim();
        break;
      }
    }
  } catch (error) {
    // Silently ignore in production builds
    if (process.env.NODE_ENV === 'development') {
      console.log('Could not load .env.local manually:', error instanceof Error ? error.message : 'Unknown error');
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Check if username is 'admin'
    if (username !== 'admin') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Get the hashed password from environment variables
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
    
    console.log('Environment check:', {
      hasHash: !!adminPasswordHash,
      hashLength: adminPasswordHash?.length,
      nodeEnv: process.env.NODE_ENV,
      allEnvVars: Object.keys(process.env).filter(key => key.includes('ADMIN'))
    });
    
    if (!adminPasswordHash) {
      console.error('ADMIN_PASSWORD_HASH not configured in environment variables');
      console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('ADMIN')));
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Compare the provided password with the hashed password
    const isValidPassword = await bcrypt.compare(password, adminPasswordHash);

    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create a simple session token (you could use JWT for more security)
    const sessionToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    
    const response = NextResponse.json({ success: true, message: 'Login successful' });
    
    // Set a secure cookie for the session
    response.cookies.set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated by checking the session cookie
    const sessionToken = request.cookies.get('admin-session');
    
    if (!sessionToken) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // For simplicity, we'll just check if the session exists
    // In a production app, you'd validate the session token properly
    return NextResponse.json({ authenticated: true });

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE() {
  // Logout - clear the session cookie
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  
  response.cookies.set('admin-session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0 // Expire immediately
  });

  return response;
} 