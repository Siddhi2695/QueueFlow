import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Users,
  Clock,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Plus,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { Modal } from '../components/common/Modal';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { analyticsService } from '../services/analytics.service';
import { queueService } from '../services/queue.service';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../context/ToastContext';
import { AnalyticsOverview, AnalyticsTrends, Queue } from '../types';

export const Dashboard: React.FC = () => {
  const { socket } = useSocket();
  const { showToast } = useToast();

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [trends, setTrends] = useState<AnalyticsTrends | null>(null);
  const [activeQueues, setActiveQueues] = useState<Queue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create queue modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQueueName, setNewQueueName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const [overviewData, trendsData, queuesData] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getTrends('week'),
        queueService.getQueues(),
      ]);
      setOverview(overviewData);
      setTrends(trendsData);
      setActiveQueues(queuesData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Socket listener for live updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchDashboardData();
    };

    socket.on('queue_stats_updated', handleUpdate);
    socket.on('queue_created', handleUpdate);
    socket.on('queue_deleted', handleUpdate);

    return () => {
      socket.off('queue_stats_updated', handleUpdate);
      socket.off('queue_created', handleUpdate);
      socket.off('queue_deleted', handleUpdate);
    };
  }, [socket]);

  const handleCreateQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueueName.trim()) return;

    setIsCreating(true);
    try {
      await queueService.createQueue(newQueueName.trim());
      showToast(`Queue "${newQueueName.trim()}" created successfully!`, 'success');
      setNewQueueName('');
      setIsModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create queue', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const formatSeconds = (sec: number) => {
    if (!sec || sec <= 0) return '0m 00s';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading Dashboard Intelligence..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Queue Intelligence Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time queue operations, waiting times and performance metrics.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Queue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <StatCard
          title="Total Queues"
          value={overview?.totalQueues ?? 0}
          subtitle={`${overview?.activeQueues ?? 0} active now`}
          icon={Layers}
          color="indigo"
        />
        <StatCard
          title="Total Tokens"
          value={overview?.totalTokens ?? 0}
          subtitle="Cumulative tickets created"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Currently Waiting"
          value={overview?.waitingCount ?? 0}
          subtitle="People in active queue"
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Currently Serving"
          value={overview?.servingCount ?? 0}
          subtitle="Tokens being assisted"
          icon={PlayCircle}
          color="indigo"
        />
        <StatCard
          title="Completed Tokens"
          value={overview?.completedCount ?? 0}
          subtitle="Successfully served"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Cancelled Tokens"
          value={overview?.cancelledCount ?? 0}
          subtitle={`Cancellation rate: ${overview?.cancellationRate ?? 0}%`}
          icon={XCircle}
          color="rose"
        />
        <StatCard
          title="Average Waiting Time"
          value={formatSeconds(overview?.avgWaitingTime ?? 0)}
          subtitle="Ticket creation to called"
          icon={TrendingUp}
          color="purple"
        />
        <StatCard
          title="Average Service Duration"
          value={formatSeconds(overview?.avgServiceDuration ?? 0)}
          subtitle="Service start to completion"
          icon={Clock}
          color="blue"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Token Generation Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Daily Token Volume
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Created vs Completed vs Cancelled tokens
              </p>
            </div>
          </div>

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
                title="No Token Activity Yet"
                description="Token activity and completion trends will appear once customers are added to queues."
                className="h-full"
              />
            )}
          </div>
        </div>

        {/* Queue Length Trends Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Queue Length Fluctuations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Waiting token counts across recorded events
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            {trends?.lengthTrends && trends.lengthTrends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.lengthTrends}>
                  <defs>
                    <linearGradient id="lengthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="timeFormatted" tick={{ fontSize: 12 }} />
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
                    name="Waiting Tokens"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#lengthGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState
                title="No Queue Events Yet"
                description="Real-time queue depth and fluctuations will display here as events occur."
                className="h-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* Active Queues Quick Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            My Active Queues
          </h2>
          <Link
            to="/queues"
            className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 flex items-center gap-1"
          >
            <span>View All Queues</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {activeQueues.length === 0 ? (
          <EmptyState
            title="No Queues Created"
            description="You haven't created any queues yet. Create your first queue to start generating tokens and managing people."
            actionText="Create Queue"
            onAction={() => setIsModalOpen(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeQueues.slice(0, 6).map((q) => (
              <div
                key={q._id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-800 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        {q.name}
                      </h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        Created {new Date(q.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge status={q.status} />
                  </div>

                  {/* Serving spotlight banner */}
                  <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Currently Serving
                    </span>
                    {q.currentServing ? (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          {q.currentServing.tokenNumber}
                        </span>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate max-w-[140px]">
                          {q.currentServing.personName}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                        No one being served right now
                      </span>
                    )}
                  </div>

                  {/* Stats line */}
                  <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 dark:border-slate-800 text-center">
                    <div>
                      <span className="text-xs text-slate-400 block">Waiting</span>
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                        {q.stats?.waitingCount ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Served</span>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {q.stats?.completedCount ?? 0}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Total</span>
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {q.stats?.totalCount ?? 0}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3">
                  <Link
                    to={`/queues/${q._id}`}
                    className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Manage Queue</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Queue Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Queue"
        description="Configure a new queue for your counter, service desk or department."
      >
        <form onSubmit={handleCreateQueue} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Queue Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Counter A - Customer Support"
              value={newQueueName}
              onChange={(e) => setNewQueueName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !newQueueName.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-all disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Queue'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

