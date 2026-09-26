#!/usr/bin/env node
/**
 * Progressive + max load test against the Awakening Classes API.
 *
 * Usage:
 *   node load-test.mjs
 *   BASE_URL=https://api.awakeningclasses.in node load-test.mjs
 *   BASE_URL=http://127.0.0.1:8000 node load-test.mjs
 *   MAX_ONLY=1 node load-test.mjs          # skip warm-up steps, go hard
 *   DURATION=20 node load-test.mjs         # seconds per step (default 12)
 *
 * Warning: this hits your live Oracle VM. Run off-peak.
 */

const BASE_URL = (process.env.BASE_URL || 'https://ac-mern-279937570516.europe-west1.run.app').replace(/\/$/, '');
const DURATION = Math.max(5, Number(process.env.DURATION) || 12);
const MAX_ONLY = process.env.MAX_ONLY === '1';

const ENDPOINTS = [
  { name: 'health', path: '/' },
  { name: 'pdf-exams', path: '/api/v1/pdfs/exams' },
  // YouTube is quota-limited — do not hammer it in load tests.
  // { name: 'youtube', path: '/api/v1/youtube/videos?limit=3' },
];

const STEPS = MAX_ONLY
  ? [100, 200, 400, 600]
  : [10, 25, 50, 100, 200, 400];

function pickEndpoint() {
  return ENDPOINTS[Math.floor(Math.random() * ENDPOINTS.length)];
}

async function once() {
  const ep = pickEndpoint();
  const started = performance.now();
  try {
    const res = await fetch(`${BASE_URL}${ep.path}`, {
      headers: { Accept: 'application/json, text/html, */*' },
      signal: AbortSignal.timeout(15000),
    });
    const ms = performance.now() - started;
    await res.arrayBuffer();
    return { ok: res.status < 500, status: res.status, ms, ep: ep.name };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      ms: performance.now() - started,
      ep: 'error',
      error: error.message,
    };
  }
}

async function runStep(concurrency) {
  const deadline = Date.now() + DURATION * 1000;
  let inFlight = 0;
  let started = 0;
  const results = [];

  return new Promise((resolve) => {
    const pump = () => {
      while (inFlight < concurrency && Date.now() < deadline) {
        inFlight += 1;
        started += 1;
        once().then((row) => {
          results.push(row);
          inFlight -= 1;
          if (Date.now() < deadline) pump();
          else if (inFlight === 0) resolve(summarize(concurrency, started, results));
        });
      }
      if (Date.now() >= deadline && inFlight === 0) {
        resolve(summarize(concurrency, started, results));
      }
    };
    pump();
  });
}

function summarize(concurrency, started, results) {
  const latencies = results.map((r) => r.ms).sort((a, b) => a - b);
  const ok = results.filter((r) => r.ok).length;
  const fail = results.length - ok;
  const status5xx = results.filter((r) => r.status >= 500).length;
  const timeouts = results.filter((r) => /abort|timeout|Timeout/i.test(r.error || '')).length;
  const p = (q) => latencies[Math.min(latencies.length - 1, Math.floor(q * (latencies.length - 1)))] || 0;
  const avg = latencies.length
    ? latencies.reduce((a, b) => a + b, 0) / latencies.length
    : 0;
  const rps = results.length / DURATION;

  return {
    concurrency,
    requests: results.length,
    started,
    ok,
    fail,
    status5xx,
    timeouts,
    rps: Number(rps.toFixed(1)),
    avgMs: Math.round(avg),
    p50: Math.round(p(0.5)),
    p95: Math.round(p(0.95)),
    p99: Math.round(p(0.99)),
    errorRate: results.length ? Number(((fail / results.length) * 100).toFixed(1)) : 100,
  };
}

function printRow(s) {
  const mark = s.errorRate > 5 || s.status5xx > 0 ? 'FAIL' : s.p95 > 3000 ? 'SLOW' : 'OK';
  console.log(
    [
      String(s.concurrency).padStart(5),
      String(s.requests).padStart(7),
      String(s.rps).padStart(7),
      String(s.avgMs).padStart(7),
      String(s.p95).padStart(7),
      String(s.p99).padStart(7),
      `${s.errorRate}%`.padStart(8),
      String(s.fail).padStart(6),
      mark.padStart(5),
    ].join('  ')
  );
}

async function preflight() {
  console.log(`\nTarget: ${BASE_URL}`);
  console.log(`Duration/step: ${DURATION}s`);
  console.log(`Endpoints: ${ENDPOINTS.map((e) => e.path).join(', ')}\n`);

  const warm = await once();
  if (!warm.ok && warm.status === 0) {
    console.error(`Preflight failed: ${warm.error}`);
    console.error('Is the API up? Check https://api.awakeningclasses.in/');
    process.exit(1);
  }
  console.log(`Preflight OK — status ${warm.status} in ${Math.round(warm.ms)}ms\n`);
}

async function main() {
  await preflight();

  console.log(
    [
      'Conc'.padStart(5),
      'Reqs'.padStart(7),
      'RPS'.padStart(7),
      'AvgMs'.padStart(7),
      'p95'.padStart(7),
      'p99'.padStart(7),
      'Err%'.padStart(8),
      'Fails'.padStart(6),
      'Flag'.padStart(5),
    ].join('  ')
  );
  console.log('-'.repeat(72));

  const rows = [];
  let breaking = null;

  for (const conc of STEPS) {
    process.stdout.write(`Running concurrency=${conc}...`);
    const summary = await runStep(conc);
    process.stdout.write('\r' + ' '.repeat(40) + '\r');
    printRow(summary);
    rows.push(summary);

    if (summary.errorRate > 10 || summary.status5xx > 0) {
      breaking = summary;
      console.log(`\nStopping — error rate high at concurrency ${conc}.`);
      break;
    }
  }

  const best = [...rows].filter((r) => r.errorRate <= 5).sort((a, b) => b.rps - a.rps)[0];
  const lastOk = [...rows].reverse().find((r) => r.errorRate <= 5);

  console.log('\n=== Summary ===');
  if (best) {
    console.log(
      `Best stable RPS: ~${best.rps} req/s at ${best.concurrency} concurrent (p95 ${best.p95}ms, errors ${best.errorRate}%)`
    );
  }
  if (lastOk) {
    console.log(
      `Highest stable concurrency: ${lastOk.concurrency} (p95 ${lastOk.p95}ms)`
    );
  }
  if (breaking) {
    console.log(
      `Broke around concurrency ${breaking.concurrency} (${breaking.errorRate}% errors, ${breaking.status5xx} x 5xx)`
    );
  } else {
    console.log('Did not break within the tested range — server handled the max step.');
  }

  // Rough users estimate: assume each active user ~0.2–1 req/s average during browse
  if (best) {
    const lightUsers = Math.round(best.rps / 0.2);
    const heavyUsers = Math.round(best.rps / 1);
    console.log(
      `Rough concurrent-user estimate: ~${heavyUsers} heavy – ~${lightUsers} light (depends on app chatter / heartbeat)`
    );
  }
  console.log('');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
