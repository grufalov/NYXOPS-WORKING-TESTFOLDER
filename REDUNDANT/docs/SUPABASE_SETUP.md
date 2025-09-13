# Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: Cases & Project Tracker
   - **Database Password**: (choose a strong password)
   - **Region**: Choose closest to your users

## Step 2: Get Your Credentials

1. Go to Settings > API in your Supabase dashboard
2. Copy your **Project URL** and **anon/public key**
3. Update your `.env` file:
   ```
   VITE_SUPABASE_URL=https://pefrjpkqxjtvikineonk.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlZnJqcGtxeGp0dmlraW5lb25rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUyNDYwNzQsImV4cCI6MjA3MDgyMjA3NH0._gvFO1CYiks9xFFJ9ZrLJXNuLYbXHOnok2y5pEeRTOY
   ```

## Step 3: Configure Google OAuth

1. **Get Google OAuth Credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to Credentials > Create Credentials > OAuth 2.0 Client IDs
   - Set Application Type to "Web application"
   - Add authorized redirect URIs:
     - `https://pefrjpkqxjtvikineonk.supabase.co/auth/v1/callback`
     - `http://localhost:5173` (for development)

2. **Configure in Supabase**:
   - Go to Authentication > Providers in your Supabase dashboard
   - Find Google and click "Enable"
   - Enter your Google OAuth credentials:
     - **Client ID**: From Google Cloud Console
     - **Client Secret**: From Google Cloud Console
   - Save configuration

## Step 4: Database Setup

The application will automatically create the required tables when you first log in. However, you can also run these SQL commands manually in the Supabase SQL Editor:

```sql
-- Enable RLS on auth.users if not already enabled
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Cases table
CREATE TABLE IF NOT EXISTS cases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;

-- Create policy for cases
CREATE POLICY "Users can only see their own cases" ON cases
  FOR ALL USING (auth.uid() = user_id);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy for projects
CREATE POLICY "Users can only see their own projects" ON projects
  FOR ALL USING (auth.uid() = user_id);

-- Handovers table
CREATE TABLE IF NOT EXISTS handovers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'incoming', 'outgoing', 'personal'
  tasks JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable RLS
ALTER TABLE handovers ENABLE ROW LEVEL SECURITY;

-- Create policy for handovers
CREATE POLICY "Users can only see their own handovers" ON handovers
  FOR ALL USING (auth.uid() = user_id);
```

## Step 5: Test Your Setup

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:5173`

3. Click "Sign in with Google"

4. You should be redirected to Google OAuth, then back to your app

5. Try creating a case, project, or handover to test database functionality

## Troubleshooting

### Common Issues:

1. **OAuth redirect error**:
   - Check that your redirect URIs are correctly configured in Google Cloud Console
   - Ensure the Supabase callback URL is exact: `https://your-project.supabase.co/auth/v1/callback`

2. **Database connection issues**:
   - Verify your `.env` file has correct credentials
   - Check that environment variables are loading (restart dev server)

3. **RLS policy errors**:
   - Make sure RLS policies are created
   - Check that the policies use `auth.uid() = user_id`

4. **CORS errors**:
   - Check allowed origins in Supabase Authentication settings
   - Add your development URL (`http://localhost:5173`) to allowed origins

## Production Deployment

For production deployment:

1. Update your `.env` with production Supabase URL
2. Add your production domain to Google OAuth authorized origins
3. Update Supabase allowed origins to include your production domain
4. Set up proper environment variables in your hosting platform

## Security Notes

- Never commit your `.env` file to version control
- Use different Supabase projects for development and production
- Regularly rotate your API keys
- Monitor your Supabase dashboard for unusual activity
