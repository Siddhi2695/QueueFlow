import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Power,
  Users,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { queueService } from '../services/queue.service';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { useSocket } from '../context/SocketContext';
import { Queue } from '../types';

export const MyQueues: React.FC = () => {
  const { showToast } = useToast();
  const { socket } = useSocket();

  const [queues, setQueues] = useState<Queue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Create queue modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newQueueName, setNewQueueName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Edit queue modal
  const [editingQueue, setEditingQueue] = useState<Queue | null>(null);
  const [editName, setEditName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Delete confirm dialog
  const [deletingQueue, setDeletingQueue] = useState<Queue | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchQueues = async () => {
    try {
      const data = await queueService.getQueues();
      setQueues(data);
    } catch (err) {
      console.error('Failed to fetch queues:', err);
      showToast('Could not load queues', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, []);

  // Socket listener for live updates
  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchQueues();
    socket.on('queue_created', handleUpdate);
    socket.on('queue_updated', handleUpdate);
    socket.on('queue_deleted', handleUpdate);
    socket.on('queue_stats_updated', handleUpdate);

    return () => {
      socket.off('queue_created', handleUpdate);
      socket.off('queue_updated', handleUpdate);
      socket.off('queue_deleted', handleUpdate);
      socket.off('queue_stats_updated', handleUpdate);
    };
  }, [socket]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQueueName.trim()) return;

    setIsCreating(true);
    try {
      await queueService.createQueue(newQueueName.trim());
      showToast(`Queue "${newQueueName.trim()}" created successfully!`, 'success');
      setNewQueueName('');
      setIsCreateOpen(false);
      fetchQueues();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to create queue', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQueue || !editName.trim()) return;

    setIsEditing(true);
    try {
      await queueService.updateQueue(editingQueue._id, { name: editName.trim() });
      showToast('Queue name updated successfully', 'success');
      setEditingQueue(null);
      fetchQueues();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update queue', 'error');
    } finally {
      setIsEditing(false);
    }
  };

  const handleToggleStatus = async (queue: Queue) => {
    const nextStatus = queue.status === 'active' ? 'closed' : 'active';
    try {
      await queueService.updateQueue(queue._id, { status: nextStatus });
      showToast(`Queue marked as ${nextStatus}`, 'success');
      fetchQueues();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update queue status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingQueue) return;
    setIsDeleting(true);
    try {
      await queueService.deleteQueue(deletingQueue._id);
      showToast('Queue deleted permanently', 'success');
      setDeletingQueue(null);
      fetchQueues();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to delete queue', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredQueues = queues.filter((q) => {
    const matchesSearch = q.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Queues
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create, configure and manage all your counters and queues.
          </p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Queue</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search queues by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'active', 'closed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Queues List Grid */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" label="Loading queues..." />
        </div>
      ) : filteredQueues.length === 0 ? (
        <EmptyState
          title="No Queues Found"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'No queues match your search query or filter.'
              : 'You have not created any queues yet. Click "New Queue" to get started.'
          }
          actionText={searchQuery || statusFilter !== 'all' ? undefined : 'Create Your First Queue'}
          onAction={() => setIsCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredQueues.map((q) => (
            <div
              key={q._id}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-800/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {q.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      ID: {q._id.substring(q._id.length - 8)}
                    </p>
                  </div>
                  <Badge status={q.status} />
                </div>

                <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
                  Created on {new Date(q.createdAt).toLocaleDateString()} at{' '}
                  {new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>

                {/* Serving callout */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-100 dark:border-slate-800 mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                    Currently Serving
                  </span>
                  {q.currentServing ? (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                        {q.currentServing.tokenNumber}
                      </span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                        {q.currentServing.personName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic">No one currently serving</span>
                  )}
                </div>

                {/* Queue Metrics */}
                <div className="grid grid-cols-3 gap-2 py-3 border-t border-slate-100 dark:border-slate-800 text-center">
                  <div>
                    <span className="text-xs text-slate-400 block">Waiting</span>
                    <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                      {q.stats?.waitingCount ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Served</span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                      {q.stats?.completedCount ?? 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Next Token</span>
                    <span className="text-base font-bold text-indigo-600 dark:text-indigo-400">
                      #{q.nextTokenNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <Link
                  to={`/queues/${q._id}`}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl text-center shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>Open Token Board</span>
                  <ExternalLink className="w-4 h-4" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingQueue(q);
                      setEditName(q.name);
                    }}
                    className="flex-1 py-2 px-3 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                    title="Edit Name"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Rename</span>
                  </button>

                  <button
                    onClick={() => handleToggleStatus(q)}
                    className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
                      q.status === 'active'
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                    }`}
                    title={q.status === 'active' ? 'Close Queue' : 'Activate Queue'}
                  >
                    <Power className="w-3.5 h-3.5" />
                    <span>{q.status === 'active' ? 'Close' : 'Activate'}</span>
                  </button>

                  <button
                    onClick={() => setDeletingQueue(q)}
                    className="p-2 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 transition-colors"
                    title="Delete Queue"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Queue Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Queue"
        description="Set up a new service counter or customer queue."
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Queue Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Counter 1 - Cashier"
              value={newQueueName}
              onChange={(e) => setNewQueueName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || !newQueueName.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Queue'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Queue Modal */}
      <Modal
        isOpen={!!editingQueue}
        onClose={() => setEditingQueue(null)}
        title="Edit Queue Name"
        description="Update the display name of this queue."
      >
        <form onSubmit={handleEdit} className="space-y-4">
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
              onClick={() => setEditingQueue(null)}
              className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isEditing || !editName.trim()}
              className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm disabled:opacity-50"
            >
              {isEditing ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Queue Confirm */}
      <ConfirmDialog
        isOpen={!!deletingQueue}
        onClose={() => setDeletingQueue(null)}
        onConfirm={handleDelete}
        title="Delete Queue?"
        message={`Are you sure you want to delete "${deletingQueue?.name}"? All associated tokens and events will be permanently removed.`}
        confirmText="Delete Queue"
        isLoading={isDeleting}
        isDestructive={true}
      />
    </div>
  );
};

