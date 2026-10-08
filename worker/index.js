import { onRequestGet as auth } from './auth.js';
import { onRequestGet as callback } from './callback.js';

// Laman static dihidang oleh ASSETS. Hanya /auth dan /callback (login CMS) lalui kod ini.
export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (request.method === 'GET' && pathname === '/auth') return auth({ request, env });
    if (request.method === 'GET' && pathname === '/callback') return callback({ request, env });
    return env.ASSETS.fetch(request);
  }
};
