import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import {
  Layers,
  Clock,
  Users,
  Volume2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { queueService } from '../services/queue.service';
import { PublicQueueDisplay as IPublicQueueDisplay } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

export const PublicQueueDisplay: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [data, setData] = useState<IPublicQueueDisplay | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Play pleasant synthetic chime when token is called
  const playChime = () => {
    try {
      if (!soundEnabled) return;
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
      osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.3); // G5

      gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.9);
    } catch (e) {
      console.error('Audio play error:', e);
    }
  };

  const fetchDisplayData = async () => {
    if (!id) return;
    try {
      const res = await queueService.getPublicDisplay(id);
      setData(res);
    } catch (err) {
      console.error('Failed to load public queue data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch initial & set up socket listener
  useEffect(() => {
    if (!id) return;
    fetchDisplayData();

    const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
    const socket: Socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      socket.emit('join_queue', id);
    });

    const handleUpdate = (payload?: any) => {
      fetchDisplayData();
      if (payload?.token && payload.waitingCount !== undefined) {
        // Someone was called!
        playChime();
      }
    };

    socket.on('token_called', handleUpdate);
    socket.on('token_added', () => fetchDisplayData());
    socket.on('token_completed', () => fetchDisplayData());
    socket.on('token_cancelled', () => fetchDisplayData());
    socket.on('token_moved', () => fetchDisplayData());
    socket.on('queue_updated', () => fetchDisplayData());

    return () => {
      socket.emit('leave_queue', id);
      socket.disconnect();
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <LoadingSpinner size="lg" label="Connecting to Live Queue Screen..." />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold mb-2">Queue Display Unavailable</h1>
        <p className="text-slate-400 text-sm max-w-sm mb-6">
          The requested queue counter could not be found or has been disabled.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
        >
          Return to QueueFlow Home
        </Link>
      </div>
    );
  }

  const { queue, currentServing, waitingTokens, totalWaiting } = data;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none overflow-hidden">
      {/* Top TV Header Bar */}
      <header className="h-20 bg-slate-900/80 border-b border-slate-800/80 px-8 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">
              {queue.name}
            </h1>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Public Display</span>
              <span>•</span>
              <span className="capitalize">{queue.status}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Audio toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl transition-colors ${
              soundEnabled
                ? 'text-indigo-400 bg-indigo-950/60 hover:bg-indigo-900/60'
                : 'text-slate-500 bg-slate-800'
            }`}
            title={soundEnabled ? 'Chime sound is enabled' : 'Chime sound is muted'}
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Clock */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800/70 border border-slate-700/60 font-mono text-base font-bold text-slate-200">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>{currentTime}</span>
          </div>
        </div>
      </header>

      {/* Main Screen Arena */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 md:p-10 items-stretch">
        {/* Massive "NOW SERVING" Spotlight (8 Cols) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 rounded-3xl p-8 md:p-12 border border-indigo-500/30 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Badge */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Now Serving
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Counter Active
            </span>
          </div>

          {/* Ticket Display */}
          <div className="my-auto py-8 text-center">
            {currentServing ? (
              <div className="space-y-4 animate-in zoom-in-95 duration-300">
                <div className="text-7xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter text-white drop-shadow-[0_10px_20px_rgba(99,102,241,0.3)]">
                  {currentServing.tokenNumber}
                </div>
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-200">
                  {currentServing.personName}
                </div>
                <p className="text-xs sm:text-sm text-slate-400">
                  Please proceed to the service counter
                </p>
              </div>
            ) : (
              <div className="space-y-3 py-12">
                <div className="text-4xl sm:text-5xl font-black text-slate-500">
                  PLEASE WAIT
                </div>
                <p className="text-slate-400 text-sm">
                  The counter is preparing for the next customer
                </p>
              </div>
            )}
          </div>

          {/* Bottom ticker inside card */}
          <div className="pt-6 border-t border-indigo-900/50 flex items-center justify-between text-xs text-slate-400">
            <span>Keep your ticket handy</span>
            <span>Total Waiting: <strong className="text-white font-mono">{totalWaiting}</strong></span>
          </div>
        </div>

        {/* "UP NEXT IN LINE" List (4-5 Cols) */}
        <div className="lg:col-span-5 xl:col-span-4 bg-slate-900/70 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>Next in Line</span>
              </h2>
              <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300">
                {totalWaiting} Waiting
              </span>
            </div>

            {waitingTokens && waitingTokens.length > 0 ? (
              <div className="space-y-3">
                {waitingTokens.slice(0, 7).map((token, idx) => (
                  <div
                    key={token.tokenNumber}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      idx === 0
                        ? 'bg-indigo-950/40 border-indigo-700/60 text-white'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center font-mono ${
                          idx === 0
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {token.position}
                      </span>
                      <span className="font-bold text-white truncate max-w-[150px]">
                        {token.personName}
                      </span>
                    </div>

                    <span className="font-mono font-black text-indigo-400 text-lg">
                      {token.tokenNumber}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-sm">
                No tickets waiting in line
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 tracking-wider uppercase font-semibold">
              QueueFlow Public Digital Signage
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

