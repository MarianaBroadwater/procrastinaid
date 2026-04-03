
// api/config.js
// Returns public config to the frontend at runtime.
// This avoids the need for VITE_ env variables to be baked in at build time.

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'no-store');
  
  return res.status(200).json({
    supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
    supabaseKey: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '',
    allowedEmail: process.env.ALLOWED_EMAIL || process.env.VITE_ALLOWED_EMAIL || '',
  });
}
