export default async function handler(req, res) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  const { name, email, authMethod } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Missing required field: email' });
  }

  // 1. Supabase Session JWT Verification (if token provided)
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

  let verifiedEmail = String(email).trim().toLowerCase();
  let verifiedName = String(name || '').trim();

  if (supabaseUrl && supabaseAnonKey && token) {
    try {
      const userRes = await fetch(`${supabaseUrl.replace(/\/+$/, '')}/auth/v1/user`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'apikey': supabaseAnonKey
        }
      });

      if (userRes.ok) {
        const userData = await userRes.json();
        if (userData && userData.email) {
          verifiedEmail = userData.email.trim().toLowerCase();
          if (!verifiedName) {
            verifiedName = userData.user_metadata?.full_name ||
                           userData.user_metadata?.name ||
                           userData.email.split('@')[0];
          }
        }
      } else {
        console.warn('Supabase token verification note (status ' + userRes.status + ') - proceeding with student log.');
      }
    } catch (authErr) {
      console.warn('Supabase Auth check caught error:', authErr.message);
    }
  }

  if (!verifiedName) {
    verifiedName = verifiedEmail.split('@')[0];
  }

  // 2. Format IST Timestamp (Indian Standard Time: UTC + 5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);
  const pad = n => String(n).padStart(2, '0');
  const d = pad(istDate.getUTCDate());
  const m = pad(istDate.getUTCMonth() + 1);
  const y = istDate.getUTCFullYear();
  let h = istDate.getUTCHours();
  const min = pad(istDate.getUTCMinutes());
  const s = pad(istDate.getUTCSeconds());
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  const istTimestamp = `${d}/${m}/${y} ${pad(h)}:${min}:${s} ${ampm} IST`;

  // 3. Forward to Google Sheet Webhook (Server-to-Server)
  const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || 'https://script.google.com/macros/s/AKfycbyBfgpmjzCIpMB-4adXIHA1Bv5wRWqxOPzPZ42h1iCYAy4Nq7uxCrLxKVBhVYbQJxUj/exec';
  const webhookSecret = process.env.GOOGLE_SHEET_WEBHOOK_SECRET || 'mms_2026';

  let sheetResponse = null;
  let sheetError = null;

  if (webhookUrl) {
    try {
      const gRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret: webhookSecret,
          name: verifiedName,
          email: verifiedEmail,
          authMethod: authMethod || 'Google',
          timestamp: istTimestamp,
          action: 'log_student'
        })
      });

      const responseText = await gRes.text();
      try {
        sheetResponse = JSON.parse(responseText);
      } catch {
        sheetResponse = { status: gRes.status, raw: responseText.slice(0, 500) };
      }
    } catch (err) {
      console.error('Failed to forward to Google Sheet Webhook:', err);
      sheetError = err.message;
    }
  }

  return res.status(200).json({
    success: true,
    student: {
      name: verifiedName,
      email: verifiedEmail,
      authMethod: authMethod || 'Google',
      timestamp: istTimestamp
    },
    sheetSync: sheetResponse,
    sheetError: sheetError || undefined
  });
}
