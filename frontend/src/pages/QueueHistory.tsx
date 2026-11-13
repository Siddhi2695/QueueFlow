import React, { useEffect, useState, useCallback } from 'react';
import {
  Search,
  Filter,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { historyService } from '../services/history.service';
import { queueService } from '../services/queue.service';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { Token, Queue } from '../types';

export const QueueHistory: React.FC = () => {
  const { showToast } = useToast();

  const [tokens, setTokens] = useState<Token[]>([]);
  const [queues, setQueues] = useState<Queue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [queueId, setQueueId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await historyService.getHistory({
        search: search.trim() || undefined,
        status: status || undefined,
        queueId: queueId || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        limit: 15,
      });

      setTokens(res.tokens);
      setTotalPages(res.pagination.totalPages);
      setTotalRecords(res.pagination.total);
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      showToast('Could not load queue history records', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [search, status, queueId, startDate, endDate, page, showToast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    // Load queue options for filter dropdown
    queueService.getQueues().then(setQueues).catch(console.error);
  }, []);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setQueueId('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const formatSeconds = (sec?: number | null) => {
    if (sec === undefined || sec === null) return '—';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${String(s).padStart(2, '0')}s`;
  };

  // CSV Export
  const exportToCSV = () => {
    if (tokens.length === 0) {
      showToast('No records to export', 'info');
      return;
    }

    const headers = [
      'Token Number',
      'Person Name',
      'Phone Number',
      'Queue Name',
      'Status',
      'Created At',
      'Called At',
      'Completed At',
      'Waiting Time (seconds)',
      'Service Duration (seconds)',
    ];

    const rows = tokens.map((t) => [
      t.tokenNumber,
      `"${t.personName.replace(/"/g, '""')}"`,
      t.phoneNumber || '',
      `"${(t.queueName || '').replace(/"/g, '""')}"`,
      t.status,
      t.createdAt ? new Date(t.createdAt).toLocaleString() : '',
      t.calledAt ? new Date(t.calledAt).toLocaleString() : '',
      t.completedAt ? new Date(t.completedAt).toLocaleString() : '',
      t.waitingTime ?? '',
      t.serviceDuration ?? '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `queueflow_history_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Queue history exported successfully!', 'success');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Queue Audit History
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete historical records, service durations and waiting metrics across all queues.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          disabled={tokens.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition-all shadow-xs disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search token, name or phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Statuses</option>
              <option value="Waiting">Waiting</option>
              <option value="Serving">Serving</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Queue Filter */}
          <div>
            <select
              value={queueId}
              onChange={(e) => {
                setQueueId(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Queues</option>
              {queues.map((q) => (
                <option key={q._id} value={q._id}>
                  {q.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          <div className="flex items-center">
            <button
              onClick={handleResetFilters}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>
        </div>

        {/* Date Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
          <span className="font-semibold uppercase tracking-wider text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Date Range:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <span className="ml-auto font-medium">
            Showing {tokens.length} of {totalRecords} records
          </span>
        </div>
      </div>

      {/* History Records Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="h-64 flex items-center justify-center">
            <LoadingSpinner size="lg" label="Loading history records..." />
          </div>
        ) : tokens.length === 0 ? (
          <EmptyState
            title="No Records Found"
            description="No queue tickets match your search parameters or filter criteria."
            actionText="Clear Filters"
            onAction={handleResetFilters}
            className="border-none rounded-none py-14"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-5">Token</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Queue</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Generated</th>
                  <th className="py-3 px-5">Called</th>
                  <th className="py-3 px-5">Completed</th>
                  <th className="py-3 px-5">Waiting Time</th>
                  <th className="py-3 px-5">Service Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tokens.map((token) => (
                  <tr
                    key={token._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        {token.tokenNumber}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {token.personName}
                      </p>
                      {token.phoneNumber && (
                        <p className="text-xs text-slate-400 mt-0.5">{token.phoneNumber}</p>
                      )}
                    </td>
                    <td className="py-4 px-5 text-slate-600 dark:text-slate-300 font-medium">
                      {token.queueName}
                    </td>
                    <td className="py-4 px-5">
                      <Badge status={token.status} />
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {new Date(token.createdAt).toLocaleDateString()}{' '}
                      {new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {token.calledAt
                        ? new Date(token.calledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="py-4 px-5 text-xs text-slate-500 dark:text-slate-400">
                      {token.completedAt
                        ? new Date(token.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </td>
                    <td className="py-4 px-5 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {formatSeconds(token.waitingTime)}
                    </td>
                    <td className="py-4 px-5 font-mono text-xs text-slate-700 dark:text-slate-300">
                      {formatSeconds(token.serviceDuration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

