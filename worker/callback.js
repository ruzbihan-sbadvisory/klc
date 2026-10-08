// Langkah 2 login CMS: tukar kod GitHub kepada token, kemudian hantar token ke tetingkap CMS.
const page = (status, content) => {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`.replace(/</g, '\\u003c');
  const body = `<!doctype html><html lang="ms"><meta charset="utf-8"><title>Log masuk CMS</title><body style="font-family:system-ui;padding:24px">
<p id="m">${status === 'success' ? 'Berjaya. Tetingkap ini akan tertutup sendiri.' : 'Log masuk gagal. Tutup tetingkap ini dan cuba lagi.'}</p>
<script>
(() => {
  const msg = ${JSON.stringify(message)};
  addEventListener('message', e => {
    if (e.origin === location.origin && e.data === 'authorizing:github') {
      window.opener && window.opener.postMessage(msg, e.origin);
    }
  });
  window.opener && window.opener.postMessage('authorizing:github', location.origin);
})();
</script></body></html>`;
  return new Response(body, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'Set-Cookie': 'cms_oauth_state=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Lax'
    }
  });
};

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const saved = /(?:^|;\s*)cms_oauth_state=([a-f0-9]+)/.exec(request.headers.get('Cookie') || '')?.[1];

  if (!code || !state || !saved || state !== saved) {
    return page('error', { provider: 'github', error: 'State tidak sah atau tamat tempoh.' });
  }

  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'site-cms-auth' },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/callback`
      })
    });
    const data = await res.json();
    if (!data.access_token) {
      return page('error', { provider: 'github', error: data.error_description || data.error || 'Token tidak diterima.' });
    }
    return page('success', { provider: 'github', token: data.access_token });
  } catch (err) {
    return page('error', { provider: 'github', error: 'Tidak dapat hubungi GitHub.' });
  }
}
