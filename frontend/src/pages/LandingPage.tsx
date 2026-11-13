import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  Users,
  Play,
  ArrowUp,
  ArrowDown,
  BarChart3,
  History,
  ShieldCheck,
  Sparkles,
  Monitor,
  ChevronRight,
  TrendingUp,
  Volume2,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'terminal' | 'dashboard' | 'display' | 'analytics'>('terminal');

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      {/* 1. Navigation Bar */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-indigo-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-indigo-300">
              QueueFlow
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => scrollToSection('hero')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('preview')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Product Preview
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              About & Benefits
            </button>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4 duration-200">
            <button
              onClick={() => scrollToSection('hero')}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('preview')}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Product Preview
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="block w-full text-left py-2 px-3 rounded-lg text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              About & Benefits
            </button>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 rounded-xl"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="w-full py-2.5 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-900 rounded-xl"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full py-2.5 text-center text-sm font-semibold text-white bg-indigo-600 rounded-xl"
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section id="hero" className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Soft radial background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-500/10 via-indigo-400/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              {/* Product Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Smart Queue Management System</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
                Manage Your Queues.{' '}
                <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-400 bg-clip-text text-transparent">
                  Save Everyone's Time.
                </span>
              </h1>

              {/* Description */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Smart, simple, and efficient queue management. Create queues, generate tokens, organize waiting lists, and monitor performance from one powerful dashboard.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/register'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>{isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>

                <button
                  onClick={() => scrollToSection('features')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-base font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all"
                >
                  <span>Explore Features</span>
                </button>
              </div>

              {/* Key Trust Highlights */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-200/60 dark:border-slate-800 text-left">
                <div>
                  <p className="text-xs text-slate-400">Sync Latency</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Real-Time WebSockets</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Setup Time</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Zero Hardware</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Display Support</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">Public TV Screen</p>
                </div>
              </div>
            </div>

            {/* Right Side: Realistic Dashboard & Token Terminal Preview */}
            <div className="lg:col-span-6">
              <div className="relative mx-auto max-w-lg lg:max-w-none">
                {/* Decorative border wrapper */}
                <div className="rounded-3xl p-2 bg-gradient-to-tr from-indigo-500/20 via-slate-200 dark:via-slate-800 to-indigo-500/10 shadow-2xl">
                  <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-inner">
                    {/* Fake Browser Window Header */}
                    <div className="px-4 py-3 bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-rose-400" />
                        <span className="w-3 h-3 rounded-full bg-amber-400" />
                        <span className="w-3 h-3 rounded-full bg-emerald-400" />
                        <span className="ml-2 text-xs font-mono font-medium text-slate-400">
                          queueflow.app/queues/counter-1
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                        Live System
                      </span>
                    </div>

                    {/* Terminal UI Body Mockup */}
                    <div className="p-5 space-y-4">
                      {/* Top Counter Bar */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-base">
                            Counter 1 - Fast Track
                          </h4>
                          <p className="text-xs text-slate-400">Next Sequential Token: #105</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </div>

                      {/* Prominent "Now Serving" Card */}
                      <div className="rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 p-5 text-white shadow-md relative overflow-hidden">
                        <div className="flex items-center justify-between mb-3 text-xs text-indigo-300">
                          <span className="uppercase tracking-wider font-semibold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Currently Serving
                          </span>
                          <span className="font-mono bg-indigo-800/50 px-2 py-0.5 rounded">
                            Elapsed: 02:45
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <div>
                            <div className="text-4xl font-black font-mono tracking-tight text-white">
                              T001
                            </div>
                            <div className="text-base font-semibold text-indigo-200 mt-1">
                              Alice Johnson
                            </div>
                          </div>
                          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Complete Service
                          </span>
                        </div>
                      </div>

                      {/* Next In Line Preview Table */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 px-1">
                          <span>Waiting in Queue (3)</span>
                          <span className="text-indigo-600 dark:text-indigo-400">Call Next Available</span>
                        </div>

                        {/* Ticket 1 */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold flex items-center justify-center">
                              1
                            </span>
                            <div>
                              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                                T002
                              </p>
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Robert Paulson
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 text-slate-400">
                            <span className="p-1 rounded bg-slate-200 dark:bg-slate-700">
                              <ArrowUp className="w-3 h-3" />
                            </span>
                            <span className="p-1 rounded bg-slate-200 dark:bg-slate-700">
                              <ArrowDown className="w-3 h-3" />
                            </span>
                          </div>
                        </div>

                        {/* Ticket 2 */}
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-xs font-bold flex items-center justify-center">
                              2
                            </span>
                            <div>
                              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                                T003
                              </p>
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                Sarah Connor
                              </p>
                            </div>
                          </div>
                          <span className="text-xs text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50">
                            Waiting
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Powerful Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Everything You Need to Streamline Customer Flow
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-4 leading-relaxed">
              Designed specifically for service desks, counters, clinics, and offices requiring high throughput and zero waiting confusion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Smart Token Generation
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Automatically generate unique, sequential token numbers (T001, T002...) scoped per queue with instant sequential waiting positions.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Easy Queue Management
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Configure counters, rename service departments, activate or close queues on demand, and manage multiple parallel desks from one view.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Real-Time Queue Updates
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Integrated Socket.IO room broadcasting synchronizes manager counters, staff desks, and public displays with zero page refreshing.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Flexible Token Priority
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Atomic Move Up and Move Down operations allow managers to accommodate priority visitors without breaking sequential queue integrity.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Analytics Dashboard
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Track queue depths, real service durations, and 24-hour peak customer arrival periods using genuine database-calculated metrics.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <History className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Queue History and Tracking
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Preserve a complete audit trail of every served or cancelled customer with search, status filters, date ranges, and 1-click CSV export.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Simple 4-Step Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              How QueueFlow Works
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-3">
              Effortless deployment and streamlined counter operations in four intuitive steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                  01
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Create Your Queue
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Name your counter or service desk (e.g. "Counter A - Inquiries"). The system instantly initializes unique sequential numbering.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Setup in seconds
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                  02
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Add People & Tokens
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Enter the customer's name and optional phone number. QueueFlow issues the next sequential ticket (T001, T002...) with their queue position.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Instant queue placement
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                  03
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Manage & Call Next
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Click "Call Next Person" to bring the first waiting customer to the counter. When finished, hit "Complete Service" to record durations.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Live TV synchronization
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs relative flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mb-4">
                  04
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  Track Queue Performance
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Inspect average waiting times, staff service speeds, and peak arrival hours. Export complete audit histories to CSV whenever needed.
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                Real database insights
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Product Preview Section */}
      <section id="preview" className="py-20 bg-slate-100/60 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Interactive System Overview
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Built for Real-World Counters
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-3">
              Explore the dedicated interfaces built into QueueFlow for managers, staff, and visitors.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mx-auto mb-10 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <button
              onClick={() => setActivePreviewTab('terminal')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activePreviewTab === 'terminal'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Token Operations Terminal
            </button>
            <button
              onClick={() => setActivePreviewTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activePreviewTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Manager Dashboard
            </button>
            <button
              onClick={() => setActivePreviewTab('display')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activePreviewTab === 'display'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Public TV Screen
            </button>
            <button
              onClick={() => setActivePreviewTab('analytics')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                activePreviewTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Operational Analytics
            </button>
          </div>

          {/* Active Preview Showcase */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xl max-w-5xl mx-auto">
            {activePreviewTab === 'terminal' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Token Management Terminal
                    </h3>
                    <p className="text-xs text-slate-400">
                      High-speed operator screen with 1-click calling and atomic reordering
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Active Desk
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-6 shadow-md">
                    <span className="text-xs uppercase font-mono text-indigo-300 tracking-wider">
                      Currently Calling
                    </span>
                    <div className="text-5xl font-mono font-black my-2">T001</div>
                    <p className="text-base font-semibold text-indigo-200">Alice Johnson</p>
                    <div className="mt-4 pt-4 border-t border-indigo-900 flex items-center justify-between text-xs">
                      <span className="text-indigo-300">Started 02m 45s ago</span>
                      <span className="px-3 py-1 bg-emerald-500 font-semibold rounded-lg">
                        Complete Service
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-5 border border-slate-200/60 dark:border-slate-700/60 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase text-slate-400">Queue Depth</h4>
                      <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">4 Waiting</p>
                      <p className="text-xs text-slate-500 mt-2">Estimated wait: ~6 mins</p>
                    </div>
                    <button className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-xs">
                      + Add New Customer
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Manager Command Dashboard
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time telemetry aggregating waiting, served, and cancelled customer counts
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400">Total Queues</span>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">6</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400">Waiting Tokens</span>
                    <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">14</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400">Served Today</span>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">82</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    <span className="text-xs text-slate-400">Avg Wait Time</span>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">3m 42s</p>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'display' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Public TV Display Screen
                    </h3>
                    <p className="text-xs text-slate-400">
                      Billboard layout for waiting room monitors without revealing customer phone numbers
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-500">/display/counter-1</span>
                </div>

                <div className="bg-slate-950 text-white rounded-2xl p-8 border border-slate-800 text-center space-y-4">
                  <span className="text-xs uppercase font-mono px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    NOW SERVING
                  </span>
                  <div className="text-7xl font-mono font-black text-indigo-400 tracking-tight">
                    T001
                  </div>
                  <p className="text-2xl font-bold text-white">Alice Johnson</p>
                  <p className="text-xs text-slate-400">Please proceed to Counter 1</p>
                </div>
              </div>
            )}

            {activePreviewTab === 'analytics' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      Operational Telemetry & Performance
                    </h3>
                    <p className="text-xs text-slate-400">
                      Calculates wait times and peak arrival hours from genuine database timestamps
                    </p>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
                    <span>Queue Velocity Formula</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">Real Calculations</span>
                  </div>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-mono">
                    Avg Waiting Time = Total Completed Wait Durations ÷ Number of Completed Tickets
                  </p>
                  <div className="pt-2 flex items-center gap-4 text-xs text-slate-500">
                    <span>✓ Real timestamps</span>
                    <span>✓ Event-based snapshot tracking</span>
                    <span>✓ Hourly arrival distribution</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. Benefits Section */}
      <section id="benefits" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Measurable Results
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
              Transforming the Waiting Experience
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-3">
              Designed to solve crowding, confusion, and customer frustration across high-volume desks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Benefit 1 */}
            <div className="flex items-start gap-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                  Reduced Waiting Confusion
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Clear digital tickets and high-visibility TV displays eliminate crowded desks and guesswork. Visitors immediately know where they stand in line.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex items-start gap-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                  Better Queue Organization
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Organize queues with atomic Move Up and Down priority adjustments. Manage customer delays without breaking the sequence.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex items-start gap-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                  Faster Service Management
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Single-click "Call Next" and automatic service completion timestamps allow operators to focus on helping customers instead of managing lines.
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex items-start gap-5 p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
                  Improved Operational Visibility
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Track performance benchmarks across all active desks. Understand peak rush hours and optimize staff coverage with real database analytics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final Call to Action Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-950 p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Ready to Make Queue Management Simpler?
              </h2>
              <p className="text-base sm:text-lg text-indigo-200/80 leading-relaxed">
                Take control of your queues and create a smoother service experience.
              </p>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to={isAuthenticated ? '/dashboard' : '/register'}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-bold text-indigo-950 bg-white hover:bg-indigo-50 shadow-lg shadow-black/20 transition-all hover:scale-105"
                >
                  {isAuthenticated ? 'Open Dashboard' : 'Get Started'}
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-base font-semibold text-white bg-indigo-800/50 hover:bg-indigo-800/80 border border-indigo-700/60 transition-all"
                >
                  Sign In to Terminal
                </Link>
              </div>

              <p className="text-xs text-indigo-300/60 pt-2">
                Internship Technical Evaluation Showcase • Ready to Deploy • MIT Licensed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-100 dark:border-slate-800">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white">
                <Layers className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                QueueFlow
              </span>
            </div>

            {/* Quick Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
              <button onClick={() => scrollToSection('hero')} className="hover:text-indigo-600">
                Home
              </button>
              <button onClick={() => scrollToSection('features')} className="hover:text-indigo-600">
                Features
              </button>
              <button onClick={() => scrollToSection('how-it-works')} className="hover:text-indigo-600">
                How It Works
              </button>
              <button onClick={() => scrollToSection('preview')} className="hover:text-indigo-600">
                Preview
              </button>
              <button onClick={() => scrollToSection('benefits')} className="hover:text-indigo-600">
                Benefits
              </button>
              <Link to="/login" className="hover:text-indigo-600">
                Manager Login
              </Link>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              Smart, simple, and efficient queue management for modern service counters.
            </p>
            <p>© 2026 QueueFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
