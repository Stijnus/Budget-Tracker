const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const port = 3001;

// Enable CORS for all routes
app.use(cors());

// Proxy middleware for Supabase Edge Functions
app.use('/api/invitations', createProxyMiddleware({
  target: 'https://tkjmzixriehtmjhllfhg.supabase.co/functions/v1',
  changeOrigin: true,
  pathRewrite: {
    '^/api/invitations': '/get-invitation'
  },
  onProxyReq: (proxyReq) => {
    // Add Supabase API key to the request
    const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
    proxyReq.setHeader('apikey', SUPABASE_ANON_KEY);
    proxyReq.setHeader('Authorization', `Bearer ${SUPABASE_ANON_KEY}`);
  }
}));

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
