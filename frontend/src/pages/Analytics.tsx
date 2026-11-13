import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Clock,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  BarChart2,
  Calendar,
} from 'lucide-react';
import { analyticsService } from '../services/analytics.service';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import {
  AnalyticsOverview,
  AnalyticsTrends,
  QueuePerformanceItem,
} from '../types';

const PIE_COLORS = ['#10b981', '#f43f5e', '#6366f1'];

export const Analytics: React.FC = () => {
  const { showToast } = useToast();

  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [performance, setPerformance] = useState<QueuePerformanceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [overviewRes, trendsRes, perfRes] = await Promise.all([
          analyticsService.getOverview(),
          analyticsService.getTrends(period),
          analyticsService.getPerformance(),
        ]);
        setOverview(overviewRes);
        setTrends(trendsRes);
        setPerformance(perfRes);
      } catch (err) {
        console.error('Failed to load analytics:', err);
        showToast('Could not load analytics metrics', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [period, showToast]);

  const formatSeconds = (sec: number) => {
    if (!sec || sec <= 0) return '0m 00s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  const pieData = [
    { name: 'Completed', value: overview?.completedCount ?? 0 },
    { name: 'Cancelled', value: overview?.cancelledCount ?? 0 },
    { name: 'Waiting / Serving', value: (overview?.waitingCount ?? 0) + (overview?.servingCount ?? 0) },
  ].filter((d) => d.value > 0);

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Computing real database analytics..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header & Period Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Operational Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real data telemetry tracking waiting durations, throughput, and queue bottlenecks.
          </p>
        </div>

        {/* Period Selector */}
        <div className="inline-flex items-center p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
                period === p
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {p === 'day' ? 'Today' : p === 'week' ? 'Past 7 Days' : 'Past 30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Top Telemetry KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          title="Average Waiting Time"
          value={formatSeconds(overview?.avgWaitingTime ?? 0)}
          subtitle="Real duration from creation to call"
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Average Service Duration"
          value={formatSeconds(overview?.avgServiceDuration ?? 0)}
          subtitle="Real duration from call to finish"
          icon={Clock}
          color="purple"
        />
        <StatCard
          title="Completion Ratio"
          value={`${
            overview && overview.totalTokens > 0
              ? Math.round((overview.completedCount / overview.totalTokens) * 100)
              : 0
          }%`}
          subtitle={`${overview?.completedCount ?? 0} tickets completed`}
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Cancellation Rate"
          value={`${overview?.cancellationRate ?? 0}%`}
          subtitle={`${overview?.cancelledCount ?? 0} tickets cancelled`}
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Charts Grid 1: Daily Trends & Completed vs Cancelled */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Token Resolution Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Token Generation & Resolution
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Daily throughput comparison between generated and served customers
          </p>

          <div className="h-72 w-full">
            {trends?.tokenTrends && trends.tokenTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.tokenTrends}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="generated" name="Generated" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cancelled" name="Cancelled" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="No Data in Selected Period"
                description="Generate tokens to start populating volume trends."
                className="h-full"
              />
            )}
          </div>
        </div>

        {/* Resolution Breakdown Pie */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Token Outcomes
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Distribution of all generated tickets
            </p>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-400 italic">No tickets to display</p>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
            <div>
              <span className="text-slate-400 block">Total Tokens</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">
                {overview?.totalTokens ?? 0}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">Completion Rate</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {overview && overview.totalTokens > 0
                  ? Math.round((overview.completedCount / overview.totalTokens) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid 2: Peak Hours & Length Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Queue Periods (Hourly distribution) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Peak Arrival Hours (24-Hour Breakdown)
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Identify rush hours to optimize staff coverage and counter allocation
          </p>

          <div className="h-64 w-full">
            {trends?.hourlyDistribution && trends.hourlyDistribution.some((h) => h.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trends.hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} interval={2} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                    }}
                  />
                  <Bar dataKey="count" name="Token Arrivals" fill="#818cf8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="No Hourly Data Yet"
                description="Ticket issuance times will reveal peak customer rush hours."
                className="h-full"
              />
            )}
          </div>
        </div>

        {/* Recorded Queue Depth Trends */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Live Waiting Queue Depth
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Real waiting queue length recorded across state change events
          </p>

          <div className="h-64 w-full">
            {trends?.lengthTrends && trends.lengthTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.lengthTrends}>
                  <defs>
                    <linearGradient id="analyticsLengthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="timeFormatted" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="waitingCount"
                    name="Waiting Count"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fill="url(#analyticsLengthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="No Waiting Depth Events"
                description="Events will chart live queue growth and depletion as counters operate."
                className="h-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* Queue-Wise Performance Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Queue Performance Comparison
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare average wait times, service speeds and cancellation rates across all your queues.
          </p>
        </div>

        {performance.length === 0 ? (
          <EmptyState
            title="No Queues Available"
            description="Create queues to see their individual operational benchmarks."
            className="border-none rounded-none py-12"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-5">Queue Name</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Total Tickets</th>
                  <th className="py-3 px-5">Waiting</th>
                  <th className="py-3 px-5">Completed</th>
                  <th className="py-3 px-5">Cancelled</th>
                  <th className="py-3 px-5">Avg Waiting Time</th>
                  <th className="py-3 px-5">Avg Service Duration</th>
                  <th className="py-3 px-5">Cancel Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {performance.map((p) => (
                  <tr
                    key={p.queueId}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-5 font-semibold text-slate-900 dark:text-white">
                      {p.queueName}
                    </td>
                    <td className="py-4 px-5">
                      <Badge status={p.status} />
                    </td>
                    <td className="py-4 px-5 font-medium">{p.totalTokens}</td>
                    <td className="py-4 px-5 text-amber-600 dark:text-amber-400 font-semibold">
                      {p.waiting}
                    </td>
                    <td className="py-4 px-5 text-emerald-600 dark:text-emerald-400 font-semibold">
                      {p.completed}
                    </td>
                    <td className="py-4 px-5 text-rose-600 dark:text-rose-400 font-semibold">
                      {p.cancelled}
                    </td>
                    <td className="py-4 px-5 font-mono text-xs">
                      {formatSeconds(p.avgWaitTime)}
                    </td>
                    <td className="py-4 px-5 font-mono text-xs">
                      {formatSeconds(p.avgServiceDuration)}
                    </td>
                    <td className="py-4 px-5">
                      <span
                        className={`text-xs font-semibold ${
                          p.cancellationRate > 20
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {p.cancellationRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

