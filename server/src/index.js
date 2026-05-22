import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import pg from 'pg';
import { verifyToken } from '@clerk/backend';

const { Pool } = pg;
const ssl =
  process.env.DATABASE_SSL === 'true' ||
  (process.env.DATABASE_URL?.includes('amazonaws.com') ?? false) ||
  (process.env.DATABASE_URL?.includes('railway.app') ?? false);

const pool =
  process.env.DATABASE_URL != null
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ...(ssl ? { ssl: { rejectUnauthorized: false } } : {}),
      })
    : null;

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

async function requireAuth(req, res, next) {
  const secretKey = process.env.CLERK_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: 'Server missing CLERK_SECRET_KEY' });
    return;
  }
  const header = req.headers.authorization;
  const token = typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) {
    res.status(401).json({ error: 'Missing Authorization Bearer token' });
    return;
  }
  try {
    const payload = await verifyToken(token, { secretKey });
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/me', requireAuth, (req, res) => {
  res.json({ userId: req.userId });
});

app.get('/api/db-ping', requireAuth, async (_req, res) => {
  if (!pool) {
    res.status(503).json({ error: 'DATABASE_URL is not configured on the server' });
    return;
  }
  try {
    const result = await pool.query('select 1 as ok');
    res.json({ postgres: true, row: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database query failed' });
  }
});

/**
 * Home “sold / pipeline” snapshot for the authenticated agent.
 * Replace the static payload with Postgres reads when listings / settlements tables exist.
 */
app.get('/api/agent-home-metrics', requireAuth, async (req, res) => {
  try {
    void req.userId;
    res.json({
      recentlySold: [
        {
          id: '1',
          addressLine: '12 Hartington St',
          suburb: 'Elsternwick',
          soldPriceDisplay: '$1.85M',
          soldAtDisplay: 'Sold 3d ago',
          imageIndex: 0,
        },
        {
          id: '2',
          addressLine: '9 Pasley St',
          suburb: 'St Kilda',
          soldPriceDisplay: '$1.42M',
          soldAtDisplay: 'Sold 1w ago',
          imageIndex: 1,
        },
        {
          id: '3',
          addressLine: '44 Orrong Rd',
          suburb: 'Armadale',
          soldPriceDisplay: '$2.10M',
          soldAtDisplay: 'Sold 2w ago',
          imageIndex: 2,
        },
      ],
      activeListingsCount: 4,
      pendingListingsCount: 2,
      soldListingsCount: 3,
      inspectionsBookedCount: 3,
      pipelineCommissionEstimateAud: { lowAud: 41250, highAud: 51500 },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load agent home metrics' });
  }
});

app.listen(port, () => {
  console.log(`OMM API listening on ${port}`);
});
