export type AdminTest = {
  seriesId: string;
  testName: string;
  price: number;
  enrollments: number;
  paidRevenue: number;
  estimatedRevenue: number;
  revenue: number;
  users?: any[];
};

export const PERIODS = [
  { id: 'all', label: 'All time', short: 'All' },
  { id: 'month', label: 'This month', short: 'Month' },
  { id: '30', label: 'Last 30 days', short: '30d' },
  { id: '90', label: 'Last 90 days', short: '90d' },
] as const;

export const REVENUE_FILTERS = [
  { id: 'all', label: 'All tests', short: 'All' },
  { id: 'paid', label: 'With revenue', short: 'Paid' },
  { id: 'free', label: 'Free', short: 'Free' },
] as const;

export function formatINR(value: number) {
  return `₹${Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export function getRange(period: string) {
  const to = new Date();
  if (period === 'all') return { from: null, to: null };
  if (period === 'month') {
    return {
      from: new Date(to.getFullYear(), to.getMonth(), 1).toISOString(),
      to: to.toISOString(),
    };
  }
  const days = period === '90' ? 90 : 30;
  const from = new Date(to);
  from.setDate(from.getDate() - days);
  return { from: from.toISOString(), to: to.toISOString() };
}

const normalizeName = (value: unknown) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

export function enrichTests(adminTests: any[], seriesList: any[]): AdminTest[] {
  const byId = new Map<string, { price: number; id: string }>();
  const byName = new Map<string, { price: number; id: string }>();

  seriesList.forEach((series) => {
    const price = Number(series?.price) || 0;
    const id = String(series?._id || series?.seriesId || '');
    const name = normalizeName(series?.seriesName || series?.testName);
    const meta = { price, id };
    if (id) byId.set(id, meta);
    if (name) byName.set(name, meta);
  });

  return (adminTests || []).map((test) => {
    const match =
      byId.get(String(test.seriesId || '')) || byName.get(normalizeName(test.testName));
    const price = Number(test.price) || match?.price || 0;
    const enrollments = test.enrollments ?? test.totalUsers ?? test.users?.length ?? 0;
    const paidRevenue = Number(test.paidRevenue) || 0;
    const estimatedRevenue = enrollments * price;
    const revenue = paidRevenue > 0 ? paidRevenue : estimatedRevenue;

    return {
      ...test,
      seriesId: test.seriesId || match?.id || '',
      testName: test.testName || 'Untitled',
      price,
      enrollments,
      paidRevenue,
      estimatedRevenue,
      revenue,
    };
  });
}
