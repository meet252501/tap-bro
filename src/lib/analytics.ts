import { DinerReviewRecord } from '@/types/restaurant';

export interface ChartBarData {
  label: string;
  count: number;
  dateStr?: string;
  isCurrent?: boolean;
}

export interface ReviewAnalyticsSummary {
  dayWise: ChartBarData[];
  weekWise: ChartBarData[];
  monthWise: ChartBarData[];
  currentCycleDay: number;
  totalCycleReviews: number;
}

export function computeReviewAnalytics(
  reviews: DinerReviewRecord[] = [],
  cycleStartDate?: string
): ReviewAnalyticsSummary {
  const now = new Date();

  // Day Wise (Last 7 Days)
  const dayWise: ChartBarData[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayLabel = i === 0 ? 'Today' : d.toLocaleDateString('en-US', { weekday: 'short' });
    const ymd = d.toISOString().slice(0, 10);
    const count = reviews.filter((r) => r.timestamp && r.timestamp.slice(0, 10) === ymd).length;
    dayWise.push({ label: dayLabel, count, dateStr: ymd, isCurrent: i === 0 });
  }

  // Week Wise (Last 4 Weeks)
  const weekWise: ChartBarData[] = [];
  for (let w = 3; w >= 0; w--) {
    const wLabel = w === 0 ? 'This Wk' : `${w}w ago`;
    const startMs = now.getTime() - (w + 1) * 7 * 24 * 60 * 60 * 1000;
    const endMs = now.getTime() - w * 7 * 24 * 60 * 60 * 1000;
    const count = reviews.filter((r) => {
      const t = new Date(r.timestamp).getTime();
      return t >= startMs && t < endMs;
    }).length;
    weekWise.push({ label: wLabel, count, isCurrent: w === 0 });
  }

  // Month Wise (Last 6 Months)
  const monthWise: ChartBarData[] = [];
  for (let m = 5; m >= 0; m--) {
    const d = new Date(now.getFullYear(), now.getMonth() - m, 1);
    const mLabel = d.toLocaleDateString('en-US', { month: 'short' });
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const count = reviews.filter((r) => r.timestamp && r.timestamp.slice(0, 7) === ym).length;
    monthWise.push({ label: mLabel, count, isCurrent: m === 0 });
  }

  // Current retention cycle progress (Day X of 30)
  const cStart = new Date(cycleStartDate || now);
  const diffDays = Math.floor((now.getTime() - cStart.getTime()) / (1000 * 60 * 60 * 24));
  const currentCycleDay = Math.min(30, Math.max(1, diffDays + 1));

  return {
    dayWise,
    weekWise,
    monthWise,
    currentCycleDay,
    totalCycleReviews: reviews.length,
  };
}
