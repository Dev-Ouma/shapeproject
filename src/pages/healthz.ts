// Liveness probe for deploys: always 200 while the app can reach its database, even in maintenance mode.
import type { APIRoute } from 'astro';
import { getDb } from '../lib/db';
import { getMaintenance } from '../lib/system';

export const GET: APIRoute = () => {
  getDb().prepare('SELECT 1').get();
  return new Response(JSON.stringify({ ok: true, maintenance: getMaintenance().on }), { headers: { 'Content-Type': 'application/json' } });
};
