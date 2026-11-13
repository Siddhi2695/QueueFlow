import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Play,
  CheckCircle2,
  XCircle,
  ArrowUp,
  ArrowDown,
  Monitor,
  Phone,
  Clock,
  User,
  Power,
  Edit2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { queueService } from '../services/queue.service';
import { tokenService } from '../services/token.service';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { QueueDetailResponse, Token } from '../types';

export const QueueDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();
  const { socket, joinQueue, leaveQueue } = useSocket();

  const [data, setData] = useState<QueueDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add person modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [personName, setPersonName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Cancel token confirm
  const [cancellingToken, setCancellingToken] = useState<Token | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Edit queue modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState('');

  // Live elapsed time for currently serving token
  const [servingElapsed, setServingElapsed] = useState<string>('00:00');

  const fetchQueueDetails = useCallback(async () => {
    if (!id) return;
    try {
      const response = await queueService.getQueueById(id);
      setData(response);
      setEditName(response.queue.name);
    } catch (err: any) {
      console.error('Failed to fetch queue details:', err);
      showToast(err.response?.data?.message || 'Could not load queue details', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    fetchQueueDetails();
  }, [fetchQueueDetails]);

  // Join Socket.io queue room
  useEffect(() => {
    if (!id) return;
    joinQueue(id);

    if (socket) {
      const handleLiveEvent = () => {
        fetchQueueDetails();
      };

      socket.on('token_added', handleLiveEvent);
      socket.on('token_called', handleLiveEvent);
      socket.on('token_completed', handleLiveEvent);
      socket.on('token_cancelled', handleLiveEvent);
      socket.on('token_moved', handleLiveEvent);
      socket.on('queue_updated', handleLiveEvent);

      return () => {
        socket.off('token_added', handleLiveEvent);
        socket.off('token_called', handleLiveEvent);
        socket.off('token_completed', handleLiveEvent);
        socket.off('token_cancelled', handleLiveEvent);
        socket.off('token_moved', handleLiveEvent);
        socket.off('queue_updated', handleLiveEvent);
        leaveQueue(id);
      };
    }

    return () => {
      leaveQueue(id);
    };
  }, [id, socket, joinQueue, leaveQueue, fetchQueueDetails]);

  // Elapsed timer for currently serving token
  useEffect(() => {
    if (!data?.currentServing?.calledAt) {
      setServingElapsed('00:00');
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(data.currentServing!.calledAt!).getTime();
      const now = new Date().getTime();
      const diffSec = Math.max(0, Math.floor((now - start) / 1000));
      const m = Math.floor(diffSec / 60);
      const s = diffSec % 60;
      setServingElapsed(`${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(interval);
  }, [data?.currentServing?.calledAt]);

  // Add person handler
  const handleAddPerson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !personName.trim()) return;

    setIsAdding(true);
    try {
      const token = await tokenService.addToken(id, personName.trim(), phoneNumber.trim());
      showToast(`Token ${token.tokenNumber} generated for ${token.personName}!`, 'success');
      setPersonName('');
      setPhoneNumber('');
      setIsAddOpen(false);
      fetchQueueDetails();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to add person to queue', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  // Call Next handler
  const handleCallNext = async () => {
    if (!id) return;
    try {
      const token = await tokenService.callNext(id);
      showToast(`Calling Token ${token.tokenNumber} (${token.personName})`, 'success');
      fetchQueueDetails();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to call next token', 'error');
    }
  };

  // Complete Service handler
  const handleCompleteService = async () => {
    if (!data?.currentServing?._id) return;
    try {
      const token = await tokenService.completeService(data.currentServing._id);
      showToast(`Service completed for ${token.tokenNumber} (${token.personName})`, 'success');
      fetchQueueDetails();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to complete service', 'error');
    }
  };

  // Move Up
  const handleMoveUp = async (tokenId: string) => {
    try {
      await tokenService.moveUp(tokenId);
      fetchQueueDetails();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Cannot move token up', 'error');
    }
  };

  // Move Down
  const handleMoveDown = async (tokenId: string) => {
    try {
      await tokenService.moveDown(tokenId);
      fetchQueueDetails();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Cannot move token down', 'error');
    }
  };

  // Cancel Token
  const handleConfirmCancel = async () => {
    if (!cancellingToken) return;
    setIsCancelling(true);
    try {
      await tokenService.cancelToken(cancellingToken._id);
      showToast(`Token ${cancellingToken.tokenNumber} cancelled`, 'success');
      setCancellingToken(null);
      fetchQueueDetails();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to cancel token', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  // Toggle Queue Status
  const handleToggleStatus = async () => {
    if (!data?.queue) return;
    const nextStatus = data.queue.status === 'active' ? 'closed' : 'active';
    try {
      await queueService.updateQueue(data.queue._id, { status: nextStatus });
      showToast(`Queue is now ${nextStatus}`, 'success');
      fetchQueueDetails();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update queue', 'error');
    }
  };

  // Edit Queue Name
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.queue || !editName.trim()) return;
    try {
      await queueService.updateQueue(data.queue._id, { name: editName.trim() });
      showToast('Queue name updated', 'success');
      setIsEditOpen(false);
      fetchQueueDetails();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update queue', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Loading queue terminal..." />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        title="Queue Not Found"
        description="The requested queue could not be found or you do not have permission to manage it."
        actionText="Back to My Queues"
        onAction={() => window.history.back()}
      />
    );
  }

  const { queue, stats, currentServing, waitingTokens } = data;
  const isQueueActive = queue.status === 'active';
  const hasWaitingTokens = waitingTokens && waitingTokens.length > 0;
  const isServingActive = !!currentServing;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Status Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            to="/queues"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">
                {queue.name}
              </h1>
              <Badge status={queue.status} />
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Queue ID: {queue._id} • Next Token: #{queue.nextTokenNumber}
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Public Screen Display Link */}
          <Link
            to={`/display/${queue._id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors shadow-xs"
            title="Open Public Waiting Room Screen Display"
          >
            <Monitor className="w-4 h-4 text-indigo-500" />
            <span>Public TV Display</span>
          </Link>

          {/* Edit queue name */}
          <button
            onClick={() => setIsEditOpen(true)}
            className="p-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
            title="Rename Queue"
          >
            <Edit2 className="w-4 h-4" />
          </button>

          {/* Toggle Active / Closed */}
          <button
            onClick={handleToggleStatus}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors ${
              isQueueActive
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isQueueActive ? 'Close Queue' : 'Activate Queue'}</span>
          </button>

          {/* Add Person Button */}
          <button
            onClick={() => setIsAddOpen(true)}
            disabled={!isQueueActive}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Person</span>
          </button>
        </div>
      </div>

      {/* Main Operations Split: Currently Serving Hero & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currently Serving Hero Card */}
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-200 border border-indigo-400/30">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                Live Service Counter
              </span>

              {isServingActive && (
                <div className="flex items-center gap-2 text-indigo-200 text-xs font-mono font-medium">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Duration: {servingElapsed}</span>
                </div>
              )}
            </div>

            {isServingActive ? (
              <div className="my-4">
                <div className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-2 font-mono">
                  {currentServing.tokenNumber}
                </div>
                <div className="text-xl md:text-2xl font-semibold text-indigo-100 flex items-center gap-2">
                  <User className="w-6 h-6 text-indigo-400" />
                  <span>{currentServing.personName}</span>
                </div>
                {currentServing.phoneNumber && (
                  <div className="text-sm text-indigo-300/80 flex items-center gap-2 mt-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{currentServing.phoneNumber}</span>
                  </div>
                )}
                <p className="text-xs text-indigo-300/60 mt-2">
                  Service started at{' '}
                  {new Date(currentServing.calledAt!).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
              </div>
            ) : (
              <div className="my-6">
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  Counter Is Currently Idle
                </h3>
                <p className="text-sm text-indigo-200/70 max-w-md">
                  {hasWaitingTokens
                    ? `${waitingTokens.length} ticket(s) waiting in line. Click "Call Next" to start serving the next person.`
                    : 'There are no waiting customers in this queue right now. Add a person using the form above.'}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons inside Hero Card */}
          <div className="pt-6 border-t border-indigo-800/60 flex flex-wrap items-center gap-3">
            {isServingActive ? (
              <button
                onClick={handleCompleteService}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-950/40 transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Complete Service</span>
              </button>
            ) : (
              <button
                onClick={handleCallNext}
                disabled={!isQueueActive || !hasWaitingTokens}
                className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-950/40 transition-all flex items-center gap-2"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Call Next Person</span>
              </button>
            )}

            {isServingActive && hasWaitingTokens && (
              <span className="text-xs text-indigo-300/80 ml-auto">
                Next in line:{' '}
                <strong className="text-white">{waitingTokens[0].tokenNumber}</strong> (
                {waitingTokens[0].personName})
              </span>
            )}
          </div>
        </div>

        {/* Side Metrics Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Queue Snapshot
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Currently Waiting
                  </span>
                </div>
                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                  {stats.waitingCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Currently Serving
                  </span>
                </div>
                <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {stats.servingCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Completed Today
                  </span>
                </div>
                <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.completedCount}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Cancelled Today
                  </span>
                </div>
                <span className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  {stats.cancelledCount}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-xs text-slate-400">
              Total Tickets Issued: <strong className="text-slate-700 dark:text-slate-200">{stats.totalTokens}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Waiting Tokens Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Waiting Queue ({waitingTokens?.length || 0})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Ordered sequentially by position. Move tokens up or down to adjust priority.
            </p>
          </div>

          <button
            onClick={() => setIsAddOpen(true)}
            disabled={!isQueueActive}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>

        {!waitingTokens || waitingTokens.length === 0 ? (
          <EmptyState
            title="Waiting Queue is Empty"
            description="No tokens are currently waiting in line. Click 'Add Customer' to generate a token."
            actionText={isQueueActive ? 'Add Customer to Queue' : undefined}
            onAction={() => setIsAddOpen(true)}
            className="border-none rounded-none py-12"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  <th className="py-3 px-6">Pos</th>
                  <th className="py-3 px-6">Token</th>
                  <th className="py-3 px-6">Customer Name</th>
                  <th className="py-3 px-6">Phone</th>
                  <th className="py-3 px-6">Added At</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6 text-right">Reorder & Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {waitingTokens.map((token, index) => {
                  const isFirst = index === 0;
                  const isLast = index === waitingTokens.length - 1;

                  return (
                    <tr
                      key={token._id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Position */}
                      <td className="py-4 px-6 font-semibold text-slate-500">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-xs flex items-center justify-center font-bold">
                          {token.position}
                        </span>
                      </td>

                      {/* Token Number */}
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          {token.tokenNumber}
                        </span>
                      </td>

                      {/* Person Name */}
                      <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">
                        {token.personName}
                      </td>

                      {/* Phone Number */}
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs">
                        {token.phoneNumber || '—'}
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-xs">
                        {new Date(token.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <Badge status={token.status} />
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Move Up */}
                          <button
                            onClick={() => handleMoveUp(token._id)}
                            disabled={isFirst}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title={isFirst ? 'Already at first position' : 'Move Up'}
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>

                          {/* Move Down */}
                          <button
                            onClick={() => handleMoveDown(token._id)}
                            disabled={isLast}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                            title={isLast ? 'Already at last position' : 'Move Down'}
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>

                          {/* Cancel Token */}
                          <button
                            onClick={() => setCancellingToken(token)}
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 transition-colors ml-1"
                            title="Cancel Token"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Person Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add Person to Queue"
        description="Enter customer details to generate a sequential token."
      >
        <form onSubmit={handleAddPerson} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Person Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Alice Johnson"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              placeholder="e.g. +1 555-0199"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isAdding || !personName.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {isAdding ? 'Generating Token...' : 'Add to Queue'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Queue Name Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Rename Queue"
      >
        <form onSubmit={handleSaveName} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Queue Name *
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!editName.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Cancel Token Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!cancellingToken}
        onClose={() => setCancellingToken(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Token?"
        message={`Are you sure you want to cancel Token ${cancellingToken?.tokenNumber} for "${cancellingToken?.personName}"? This token will be removed from the waiting positions and recorded as cancelled.`}
        confirmText="Cancel Token"
        isLoading={isCancelling}
        isDestructive={true}
      />
    </div>
  );
};

