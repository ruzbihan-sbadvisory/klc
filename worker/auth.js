// Langkah 1 login CMS: hantar pengguna ke GitHub untuk beri kebenaran.
const hex = bytes => [...bytes].map(b => b.toString(16).padStart(2, '0')).join('');

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  if (url.searchParams.get('provider') !== 'github') {
    return new Response('Provider tidak disokong.', { status: 400 });
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return new Response('GITHUB_CLIENT_ID dan GITHUB_CLIENT_SECRET belum ditetapkan di Cloudflare.', { status: 500 });
  }

  const allowed = ['repo', 'public_repo', 'user'];
  const asked = (url.searchParams.get('scope') || '').split(/[,\s]+/).filter(x => allowed.includes(x));
  const scope = asked.length ? asked.join(',') : 'repo';
  const state = hex(crypto.getRandomValues(new Uint8Array(16)));

  const gh = new URL('https://github.com/login/oauth/authorize');
  gh.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  gh.searchParams.set('redirect_uri', `${url.origin}/callback`);
  gh.searchParams.set('scope', scope);
  gh.searchParams.set('state', state);

  return new Response(null, {
    status: 302,
    headers: {
      Location: gh.href,
      'Set-Cookie': `cms_oauth_state=${state}; HttpOnly; Secure; Path=/; Max-Age=600; SameSite=Lax`
    }
  });
}
