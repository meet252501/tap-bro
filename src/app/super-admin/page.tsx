'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Crown,
  Mail,
  KeyRound,
  LogIn,
  Send,
  Plus,
  Trash2,
  ExternalLink,
  Store,
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  RefreshCw,
  Eye,
  Copy,
  Check,
  Server,
  Lock,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  MessageCircle,
  Zap,
  RotateCcw,
} from 'lucide-react';
import { Restaurant, BusinessInvite } from '@/types/restaurant';

export default function SuperAdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminEmail, setAdminEmail] = useState('princesharma9955a@gmail.com');
  const [adminPin, setAdminPin] = useState('prince@777');
  const [authError, setAuthError] = useState<string | null>(null);

  // Dashboard Data
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [invites, setInvites] = useState<BusinessInvite[]>([]);
  const [sentEmails, setSentEmails] = useState<any[]>([]);
  const [config, setConfig] = useState<any>(null);

  // Invite Form & Auto-Reset State
  const [targetEmail, setTargetEmail] = useState('');
  const [inviteNotes, setInviteNotes] = useState('');
  const [inviting, setInviting] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [dispatchedInvite, setDispatchedInvite] = useState<{ email: string; tempPass: string } | null>(null);
  const [registeredNotice, setRegisteredNotice] = useState<{ email: string; restaurantName: string } | null>(null);

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Email Provider Settings (3rd-Party & SMTP)
  const [selectedProvider, setSelectedProvider] = useState<'brevo' | 'resend' | 'smtp'>('resend');
  const [brevoApiKey, setBrevoApiKey] = useState('');
  const [brevoFromEmail, setBrevoFromEmail] = useState('princesharma9955a@gmail.com');
  const [brevoFromName, setBrevoFromName] = useState('Tap-Bro Team');

  const [resendApiKey, setResendApiKey] = useState('');
  const [resendFrom, setResendFrom] = useState('Tap-Bro <onboarding@resend.dev>');

  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('princesharma9955a@gmail.com');
  const [smtpPass, setSmtpPass] = useState('prince@777');
  const [smtpFrom, setSmtpFrom] = useState('Tap-Bro Team <princesharma9955a@gmail.com>');

  const [testingEmail, setTestingEmail] = useState(false);
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [emailSaveSuccess, setEmailSaveSuccess] = useState<string | null>(null);

  // Auto-reset when the business owner completes registration in the database
  useEffect(() => {
    if (!isLoggedIn || !dispatchedInvite) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/super-admin/overview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ superAdminEmail: adminEmail, superAdminPin: adminPin }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setStats(data.stats);
          setRestaurants(data.restaurants);
          setInvites(data.invites);
          setSentEmails(data.sentEmails);

          const cleanEmail = dispatchedInvite.email.trim().toLowerCase();
          const matchedRest = data.restaurants.find(
            (r: Restaurant) => r.email && r.email.toLowerCase() === cleanEmail
          );
          const matchedInvite = data.invites.find(
            (inv: BusinessInvite) =>
              inv.email.toLowerCase() === cleanEmail && inv.tempPass === dispatchedInvite.tempPass
          );

          // If found in restaurants table or invite is completed: Auto-reset!
          if (matchedRest || (matchedInvite && matchedInvite.status === 'completed')) {
            const restName = matchedRest?.name || 'New Restaurant';
            setDispatchedInvite(null);
            setRegisteredNotice({
              email: cleanEmail,
              restaurantName: restName,
            });
          }
        }
      } catch (e) {}
    }, 3000);

    return () => clearInterval(interval);
  }, [isLoggedIn, dispatchedInvite, adminEmail, adminPin]);

  const fetchOverview = async (pin = adminPin) => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/overview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ superAdminEmail: adminEmail, superAdminPin: pin }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStats(data.stats);
        setRestaurants(data.restaurants);
        setInvites(data.invites);
        setSentEmails(data.sentEmails);
        if (data.config) {
          setConfig(data.config);
          if (data.config.emailProvider) setSelectedProvider(data.config.emailProvider);
          if (data.config.brevoApiKey) setBrevoApiKey(data.config.brevoApiKey);
          if (data.config.brevoFromEmail) setBrevoFromEmail(data.config.brevoFromEmail);
          if (data.config.brevoFromName) setBrevoFromName(data.config.brevoFromName);
          if (data.config.resendApiKey) setResendApiKey(data.config.resendApiKey);
          if (data.config.resendFrom) setResendFrom(data.config.resendFrom);
          if (data.config.smtp) {
            setSmtpHost(data.config.smtp.host || 'smtp.gmail.com');
            setSmtpPort(data.config.smtp.port || 587);
            setSmtpUser(data.config.smtp.user || 'princesharma9955a@gmail.com');
            setSmtpPass(data.config.smtp.pass || 'prince@777');
            setSmtpFrom(data.config.smtp.from || 'Tap-Bro Team <princesharma9955a@gmail.com>');
          }
        }
        setIsLoggedIn(true);
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    fetchOverview(adminPin);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail.trim()) return;
    setInviting(true);
    setRegisteredNotice(null);

    try {
      const res = await fetch('/api/super-admin/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          superAdminEmail: adminEmail,
          superAdminPin: adminPin,
          targetEmail: targetEmail.trim(),
          notes: inviteNotes.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDispatchedInvite({
          email: targetEmail.trim(),
          tempPass: data.invite.tempPass,
        });
        setTargetEmail('');
        setInviteNotes('');
        setInviting(false);
        fetchOverview(adminPin);
      } else {
        alert(data.error || 'Failed to dispatch invite');
        setInviting(false);
      }
    } catch (err: any) {
      alert(err.message || 'Error sending invite');
      setInviting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    setSavingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    try {
      const res = await fetch('/api/super-admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          superAdminEmail: adminEmail,
          currentPassword: adminPin,
          newPassword: newPassword.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordSuccess(`Password updated and hard-saved to: ${data.newPassword}`);
        setAdminPin(data.newPassword);
        setNewPassword('');
        fetchOverview(data.newPassword);
      } else {
        setPasswordError(data.error || 'Failed to update password');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Network error updating password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveEmailConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingEmail(true);
    setEmailSaveSuccess(null);

    try {
      const res = await fetch('/api/super-admin/update-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          superAdminEmail: adminEmail,
          superAdminPin: adminPin,
          emailProvider: selectedProvider,
          brevoApiKey,
          brevoFromEmail,
          brevoFromName,
          resendApiKey,
          resendFrom,
          smtp: {
            host: smtpHost,
            port: Number(smtpPort),
            user: smtpUser,
            pass: smtpPass,
            from: smtpFrom,
          },
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEmailSaveSuccess(`Email settings (${selectedProvider.toUpperCase()}) saved and activated!`);
        fetchOverview(adminPin);
      } else {
        alert(data.error || 'Failed to save email settings');
      }
    } catch (err: any) {
      alert(err.message || 'Error saving email settings');
    } finally {
      setSavingEmail(false);
    }
  };

  const handleTestEmail = async () => {
    setTestingEmail(true);
    setEmailTestResult(null);

    try {
      const res = await fetch('/api/super-admin/test-smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          superAdminEmail: adminEmail,
          superAdminPin: adminPin,
          provider: selectedProvider,
          targetEmail: adminEmail,
          brevoApiKey,
          brevoFromEmail,
          brevoFromName,
          resendApiKey,
          resendFrom,
          smtp: {
            host: smtpHost,
            port: Number(smtpPort),
            user: smtpUser,
            pass: smtpPass,
            from: smtpFrom,
          },
        }),
      });
      const data = await res.json();
      setEmailTestResult(data);
    } catch (err: any) {
      setEmailTestResult({
        success: false,
        message: err.message || 'Failed to execute email test',
      });
    } finally {
      setTestingEmail(false);
    }
  };

  const handleDeleteRestaurant = async (restaurantId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action is irreversible.`)) return;

    try {
      const res = await fetch('/api/super-admin/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          superAdminEmail: adminEmail,
          superAdminPin: adminPin,
          restaurantId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchOverview(adminPin);
      } else {
        alert(data.error || 'Failed to delete');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting');
    }
  };

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to delete this invite record?')) return;

    try {
      const res = await fetch('/api/super-admin/delete-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          superAdminEmail: adminEmail,
          superAdminPin: adminPin,
          inviteId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        fetchOverview(adminPin);
      } else {
        alert(data.error || 'Failed to delete invite');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting invite');
    }
  };

  const copySetupLink = (email: string, tempPass: string) => {
    const url = `${window.location.origin}/setup?email=${encodeURIComponent(email)}&pass=${encodeURIComponent(tempPass)}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(tempPass);
    setTimeout(() => setCopiedLink(null), 3000);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-page flex flex-col justify-center items-center p-4 relative selection:bg-amber-400 selection:text-page">
        <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-amber-500/30 bg-surface-card p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl overflow-hidden border border-amber-400/40 shadow-xl shadow-amber-500/20 mb-3 bg-surface">
              <img src="/tap-bro-logo.png" alt="Tap-Bro Logo" className="h-full w-full object-cover" />
            </div>
            <h1 className="text-xl font-extrabold text-white">Tap-Bro Super Admin</h1>
            <p className="text-xs text-text-secondary mt-1">
              Authorized Master Portal for Platform Owner
            </p>
          </div>

          {authError && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Super Admin Password
              </label>
              <div className="relative">
                <KeyRound className="h-4 w-4 text-zinc-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. prince@777"
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 py-2.5 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Hard-saved master password: <span className="text-amber-400 font-bold font-mono">prince@777</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3 font-semibold text-page shadow-lg shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition text-xs sm:text-sm"
            >
              <LogIn className="h-4 w-4" />
              <span>{loading ? 'Verifying...' : 'Access Super Admin Dashboard'}</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-text-primary selection:bg-amber-400 selection:text-page relative">
      <div className="ambient-bg pointer-events-none fixed inset-0 z-0" />

      {/* Top Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden border border-amber-400/40 shadow-md shadow-amber-500/10 shrink-0">
              <img src="/tap-bro-logo.png" alt="Tap-Bro Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">Tap-Bro Super Admin</h1>
                <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                  Master Control
                </span>
              </div>
              <p className="text-[11px] text-text-secondary">Owner: {adminEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOverview(adminPin)}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-raised px-3 py-1.5 text-xs text-text-secondary hover:text-white"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="rounded-xl border border-border px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-6 relative z-10 space-y-6">
        {/* Metric Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-border bg-surface-card p-4 space-y-1">
              <span className="text-[11px] font-medium text-text-secondary">Active Businesses</span>
              <p className="text-2xl font-bold text-white">{stats.totalRestaurants}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-card p-4 space-y-1">
              <span className="text-[11px] font-medium text-text-secondary">Pending Invites</span>
              <p className="text-2xl font-bold text-amber-400">{stats.pendingInvites}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-card p-4 space-y-1">
              <span className="text-[11px] font-medium text-text-secondary">Total Review Drafts</span>
              <p className="text-2xl font-bold text-emerald-400">{stats.totalReviewsDrafted}</p>
            </div>
            <div className="rounded-2xl border border-border bg-surface-card p-4 space-y-1">
              <span className="text-[11px] font-medium text-text-secondary">Sent Notification Emails</span>
              <p className="text-2xl font-bold text-blue-400">{sentEmails.length}</p>
            </div>
          </div>
        )}

        {/* Automatic Registration Confirmation Toast (when registered in DB) */}
        {registeredNotice && (
          <div className="rounded-2xl border border-emerald-500/60 bg-emerald-500/15 p-4 shadow-xl flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-black font-extrabold shadow-md shrink-0 text-lg">
                🎉
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">
                  Business Registered in Database: <span className="text-amber-400">{registeredNotice.restaurantName}</span>
                </h4>
                <p className="text-xs text-emerald-200">
                  Owner <code className="bg-emerald-950/60 px-1.5 py-0.5 rounded text-amber-300 font-mono">{registeredNotice.email}</code> has completed their setup in the database! Station automatically reset.
                </p>
              </div>
            </div>
            <button
              onClick={() => setRegisteredNotice(null)}
              className="rounded-lg border border-border px-2.5 py-1 text-xs text-zinc-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Feed Owner Email ➔ Send Tap-Bro Invite & Temporary Pass */}
        <div className="rounded-2xl border border-amber-500/40 bg-surface-card p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/20">
                <Send className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  Feed Owner Email ➔ Send Tap-Bro Invite &amp; Temporary Pass
                </h2>
                <p className="text-xs text-text-secondary">
                  Enter the email address of a restaurant or business owner. Tap-Bro will generate a unique temporary password and invite them. Even without email, you can copy their setup link or share directly to their WhatsApp with 1 tap!
                </p>
              </div>
            </div>

            {dispatchedInvite && (
              <button
                type="button"
                onClick={() => setDispatchedInvite(null)}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-400 transition border border-border px-2.5 py-1 rounded-lg shrink-0"
                title="Reset this station to send another invite"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Station</span>
              </button>
            )}
          </div>

          {/* Real-time Dispatched Banner with Auto-Delivery Confirmation & Auto-Reset Watcher */}
          {dispatchedInvite && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 space-y-3 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  <span>
                    Email Automatically Sent &amp; Delivered to{' '}
                    <span className="text-white underline">{dispatchedInvite.email}</span>!
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">Temporary Pass:</span>
                  <code className="rounded-lg bg-surface border border-amber-400/40 px-2.5 py-1 text-sm font-mono font-extrabold text-amber-300 tracking-wider">
                    {dispatchedInvite.tempPass}
                  </code>
                </div>
              </div>

              <div className="rounded-xl border border-border/60 bg-surface/80 p-3 text-xs text-zinc-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="truncate max-w-md text-zinc-400 font-mono text-[11px]">
                  Setup Link:{' '}
                  <span className="text-amber-400">
                    {typeof window !== 'undefined'
                      ? `${window.location.origin}/setup?email=${encodeURIComponent(
                          dispatchedInvite.email
                        )}&pass=${encodeURIComponent(dispatchedInvite.tempPass)}`
                      : ''}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* WhatsApp Button */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Hello! Welcome to Tap-Bro. Here is your digital restaurant onboarding link:\n${
                        typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
                      }/setup?email=${encodeURIComponent(
                        dispatchedInvite.email
                      )}&pass=${encodeURIComponent(dispatchedInvite.tempPass)}\nTemporary Pass: ${
                        dispatchedInvite.tempPass
                      }`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30 transition shadow-sm"
                    title="Share via WhatsApp"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Share on WhatsApp</span>
                  </a>

                  {/* Copy Link Button */}
                  <button
                    type="button"
                    onClick={() => copySetupLink(dispatchedInvite.email, dispatchedInvite.tempPass)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-surface-raised border border-border px-3 py-1.5 text-xs font-semibold text-amber-400 hover:text-white transition"
                  >
                    {copiedLink === dispatchedInvite.tempPass ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {copiedLink === dispatchedInvite.tempPass ? 'Link Copied!' : 'Copy Direct Link'}
                    </span>
                  </button>

                  {/* Manual Reset Button */}
                  <button
                    type="button"
                    onClick={() => setDispatchedInvite(null)}
                    className="inline-flex items-center gap-1 rounded-xl border border-zinc-700 bg-surface px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white transition"
                    title="Dismiss and reset station"
                  >
                    <span>✕ Reset</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2.5 border-t border-emerald-500/20 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    Email delivered! You do not need to wait here.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-zinc-400">
                    Owner can activate whenever they open their email.
                  </span>
                  <button
                    type="button"
                    onClick={() => setDispatchedInvite(null)}
                    className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-3 py-1 text-xs font-bold text-page shadow-sm hover:from-amber-300 hover:to-amber-400 transition flex items-center gap-1 shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Send Another Invite</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSendInvite} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <input
                type="email"
                required
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="Business Owner Email (e.g. manager@tajdining.com)"
                className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-xs sm:text-sm text-white focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={inviting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 px-4 font-semibold text-page shadow-md shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition text-xs sm:text-sm disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{inviting ? 'Dispatching...' : 'Send Temp Pass & Invite'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Configuration Row: Password Manager & 3rd-Party Free Email Setup */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Password Manager (Hard-Saved) */}
          <div className="rounded-2xl border border-border bg-surface-card p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Super Admin Password Manager</h3>
              </div>
              <span className="rounded-full bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 text-[10px] font-mono text-amber-300">
                Hard-Saved
              </span>
            </div>

            <div className="rounded-xl border border-border/60 bg-surface p-3 space-y-1 text-xs">
              <div className="text-zinc-400">Current Active Password:</div>
              <div className="text-amber-400 font-mono font-bold text-sm tracking-wider flex items-center justify-between">
                <span>{config?.superAdminPassword || adminPin || 'prince@777'}</span>
                <span className="text-[10px] text-zinc-500 font-sans font-normal">Active &amp; Saved in DB</span>
              </div>
            </div>

            {passwordSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Change Password To:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter new master password (e.g. prince@777)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-xs text-white focus:border-amber-400 focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2.5 px-4 font-semibold text-page shadow-md shadow-amber-500/20 hover:from-amber-300 hover:to-amber-400 transition text-xs disabled:opacity-50"
              >
                <ShieldCheck className="h-4 w-4" />
                <span>{savingPassword ? 'Hard-Saving...' : 'Save & Hard-Save Password'}</span>
              </button>
            </form>
          </div>

          {/* Card 2: 3rd-Party Free Email Services (Resend / Brevo / SMTP) */}
          <div className="rounded-2xl border border-border bg-surface-card p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white">3rd-Party Email Setup (REST API)</h3>
              </div>
              <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-mono text-emerald-400">
                Connected
              </span>
            </div>

            {/* Provider Tabs */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedProvider('resend')}
                className={`py-2 px-2.5 rounded-xl border text-center transition font-semibold flex flex-col items-center justify-center gap-0.5 ${
                  selectedProvider === 'resend'
                    ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-sm'
                    : 'border-border bg-surface text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs">Resend API</span>
                <span className="text-[10px] text-emerald-400 font-normal">Active &amp; Tested</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProvider('brevo')}
                className={`py-2 px-2.5 rounded-xl border text-center transition font-semibold flex flex-col items-center justify-center gap-0.5 ${
                  selectedProvider === 'brevo'
                    ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-sm'
                    : 'border-border bg-surface text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs">Brevo (Sendinblue)</span>
                <span className="text-[10px] text-blue-400 font-normal">300 free/day</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedProvider('smtp')}
                className={`py-2 px-2.5 rounded-xl border text-center transition font-semibold flex flex-col items-center justify-center gap-0.5 ${
                  selectedProvider === 'smtp'
                    ? 'border-amber-400 bg-amber-500/15 text-amber-300 shadow-sm'
                    : 'border-border bg-surface text-zinc-400 hover:text-white'
                }`}
              >
                <span className="text-xs">Gmail SMTP</span>
                <span className="text-[10px] text-zinc-400 font-normal">App Password</span>
              </button>
            </div>

            {/* Provider Guide Banner */}
            {selectedProvider === 'resend' && (
              <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-xs text-zinc-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-blue-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Resend API Status: Connected &amp; Verified</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Your Resend key is loaded. When inviting external restaurant owners, you can verify your custom domain on Resend or use the <strong>1-Click Gmail</strong> and <strong>WhatsApp</strong> buttons on the invite card for instant delivery!
                </p>
              </div>
            )}

            {selectedProvider === 'brevo' && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs text-zinc-300 space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Brevo: Free 300 Emails/Day to ANY Address:</span>
                </div>
                <ol className="list-decimal list-inside text-[11px] text-zinc-400 space-y-1 leading-relaxed">
                  <li>Sign up for free at <a href="https://app.brevo.com" target="_blank" rel="noreferrer" className="text-amber-400 underline font-semibold">brevo.com</a>.</li>
                  <li>Go to <strong>SMTP &amp; API</strong> &gt; <strong>API Keys</strong> &gt; Click <strong>Generate a new API key</strong>.</li>
                  <li>Paste the key below. It sends over HTTPS (Port 443)—never blocked by firewalls!</li>
                </ol>
              </div>
            )}

            {selectedProvider === 'smtp' && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-xs text-zinc-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-amber-400">
                  <HelpCircle className="h-3.5 w-3.5" />
                  <span>Gmail SMTP Setup:</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Requires a 16-character Google App Password from{' '}
                  <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noreferrer" className="text-amber-400 underline">
                    myaccount.google.com/apppasswords
                  </a>.
                </p>
              </div>
            )}

            {emailSaveSuccess && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                <span>{emailSaveSuccess}</span>
              </div>
            )}

            {emailTestResult && (
              <div
                className={`rounded-xl border p-3 text-xs leading-relaxed ${
                  emailTestResult.success
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                    : 'border-red-500/30 bg-red-500/10 text-red-300'
                }`}
              >
                <div className="font-semibold mb-1">
                  {emailTestResult.success ? '🟢 Test Successful:' : '⚠️ Diagnostics:'}
                </div>
                <div className="whitespace-pre-line text-[11px]">{emailTestResult.message}</div>
              </div>
            )}

            <form onSubmit={handleSaveEmailConfig} className="space-y-3">
              {/* Form Fields for Resend */}
              {selectedProvider === 'resend' && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Resend API Key (<span className="text-amber-400 font-mono">re_...</span>)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Paste your Resend API Key (re_...)"
                      value={resendApiKey}
                      onChange={(e) => setResendApiKey(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">From Header</label>
                    <input
                      type="text"
                      value={resendFrom}
                      onChange={(e) => setResendFrom(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Form Fields for Brevo */}
              {selectedProvider === 'brevo' && (
                <div className="space-y-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-400 mb-1">
                      Brevo API Key (<span className="text-amber-400 font-mono">xkeysib-...</span>)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Paste your Brevo API Key (xkeysib-...)"
                      value={brevoApiKey}
                      onChange={(e) => setBrevoApiKey(e.target.value)}
                      className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Sender Email</label>
                      <input
                        type="email"
                        value={brevoFromEmail}
                        onChange={(e) => setBrevoFromEmail(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Sender Name</label>
                      <input
                        type="text"
                        value={brevoFromName}
                        onChange={(e) => setBrevoFromName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Form Fields for SMTP */}
              {selectedProvider === 'smtp' && (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">SMTP Host</label>
                      <input
                        type="text"
                        value={smtpHost}
                        onChange={(e) => setSmtpHost(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">SMTP Port</label>
                      <input
                        type="number"
                        value={smtpPort}
                        onChange={(e) => setSmtpPort(Number(e.target.value))}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">Username / Email</label>
                      <input
                        type="email"
                        value={smtpUser}
                        onChange={(e) => setSmtpUser(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-zinc-400 mb-1">App Password</label>
                      <input
                        type="text"
                        value={smtpPass}
                        onChange={(e) => setSmtpPass(e.target.value)}
                        className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={testingEmail}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 py-2 px-3 text-xs text-amber-300 hover:bg-amber-500/20 transition font-semibold disabled:opacity-50"
                >
                  <Server className="h-3.5 w-3.5" />
                  <span>{testingEmail ? 'Testing Live...' : `Test ${selectedProvider.toUpperCase()}`}</span>
                </button>
                <button
                  type="submit"
                  disabled={savingEmail}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-2 px-3 text-xs font-semibold text-page shadow-md hover:from-amber-300 hover:to-amber-400 transition disabled:opacity-50"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{savingEmail ? 'Saving...' : `Save ${selectedProvider.toUpperCase()}`}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Active Restaurants Table */}
        <div className="rounded-2xl border border-border bg-surface-card overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Active Onboarded Businesses</h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">{restaurants.length} active</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised border-b border-border/80 text-text-secondary uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Business Name &amp; ID</th>
                  <th className="py-3 px-4">Owner Contact</th>
                  <th className="py-3 px-4">Cuisine &amp; Tables</th>
                  <th className="py-3 px-4">Reviews Drafted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-zinc-200">
                {restaurants.map((rest) => (
                  <tr key={rest.id} className="hover:bg-surface-raised/40 transition">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{rest.name}</div>
                      <div className="text-[11px] font-mono text-amber-400">{rest.id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{rest.phone}</div>
                      <div className="text-[11px] text-zinc-400">{rest.email || 'No email'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div>{rest.cuisine}</div>
                      <div className="text-[11px] text-zinc-400">{rest.tableCount || 10} Table Stands</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-amber-400/10 px-2 py-0.5 text-amber-300 font-bold">
                        {rest.totalReviewsGenerated || 0} reviews
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <Link
                        href={`/admin/${rest.slug}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-raised px-2.5 py-1 text-xs text-zinc-300 hover:text-white hover:border-amber-400"
                        title="Manage Restaurant"
                      >
                        <Eye className="h-3 w-3 text-amber-400" />
                        <span>Admin</span>
                      </Link>
                      <Link
                        href={`/r/${rest.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-raised px-2.5 py-1 text-xs text-zinc-300 hover:text-white"
                        title="Diner Tabletop Station"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                      <button
                        onClick={() => handleDeleteRestaurant(rest.id, rest.name)}
                        className="inline-flex items-center rounded-lg border border-red-500/30 bg-red-500/10 p-1 text-red-400 hover:bg-red-500/20"
                        title="Delete Restaurant"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pending & Completed Invites Table */}
        <div className="rounded-2xl border border-border bg-surface-card overflow-hidden shadow-xl">
          <div className="px-5 py-4 border-b border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Invitation &amp; Temp Pass Records</h3>
            </div>
            <span className="text-xs text-zinc-500 font-mono">{invites.length} dispatched</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-raised border-b border-border/80 text-text-secondary uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Invited Email</th>
                  <th className="py-3 px-4">Temporary Pass</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date Dispatched</th>
                  <th className="py-3 px-4 text-right">Instant Onboarding</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-zinc-200">
                {invites.map((inv) => {
                  const setupLink =
                    typeof window !== 'undefined'
                      ? `${window.location.origin}/setup?email=${encodeURIComponent(
                          inv.email
                        )}&pass=${encodeURIComponent(inv.tempPass)}`
                      : `/setup?email=${encodeURIComponent(inv.email)}&pass=${encodeURIComponent(
                          inv.tempPass
                        )}`;
                  const whatsappText = `Hello! Welcome to Tap-Bro. Here is your digital restaurant onboarding link:\n${setupLink}\nTemporary Pass: ${inv.tempPass}`;
                  const gmailComposeUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                    inv.email
                  )}&su=${encodeURIComponent(
                    `🔑 Your Tap-Bro Temporary Access Pass: ${inv.tempPass}`
                  )}&body=${encodeURIComponent(
                    `Hello,\n\nYou have been invited to Tap-Bro Tabletop AI Review Station!\n\nYour Temporary Access Pass: ${inv.tempPass}\n\nComplete your restaurant setup here:\n${setupLink}\n\nBest regards,\nTap-Bro Team`
                  )}`;

                  return (
                    <tr key={inv.id} className="hover:bg-surface-raised/40 transition">
                      <td className="py-3 px-4 font-medium text-white">{inv.email}</td>
                      <td className="py-3 px-4">
                        <code className="rounded bg-surface-raised px-2 py-0.5 text-amber-300 font-mono font-bold">
                          {inv.tempPass}
                        </code>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            inv.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}
                        >
                          {inv.status === 'completed' ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Setup Done ({inv.restaurantSlug})</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3" />
                              <span>Pending Owner Setup</span>
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400 text-[11px]">
                        {new Date(inv.createdAt).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {inv.status === 'pending' && (
                          <>
                            {/* Gmail 1-Click Compose */}
                            <a
                              href={gmailComposeUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-2 py-1 text-[11px] text-red-300 hover:bg-red-500/20 transition font-medium"
                              title="Send email via Gmail in 1 click"
                            >
                              <Mail className="h-3 w-3" />
                              <span>Gmail</span>
                            </a>

                            {/* WhatsApp Direct Share */}
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(whatsappText)}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-[11px] text-emerald-400 hover:bg-emerald-500/20 transition font-medium"
                              title="Share via WhatsApp"
                            >
                              <MessageCircle className="h-3 w-3" />
                              <span>WhatsApp</span>
                            </a>

                            {/* Copy Link */}
                            <button
                              type="button"
                              onClick={() => copySetupLink(inv.email, inv.tempPass)}
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-raised px-2 py-1 text-[11px] text-amber-400 hover:text-white"
                              title="Copy Direct Link"
                            >
                              {copiedLink === inv.tempPass ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                              <span>{copiedLink === inv.tempPass ? 'Copied' : 'Copy Link'}</span>
                            </button>

                            {/* Delete Invite */}
                            <button
                              type="button"
                              onClick={() => handleDeleteInvite(inv.id)}
                              className="inline-flex items-center rounded-lg border border-red-500/30 bg-red-500/10 p-1 text-red-400 hover:bg-red-500/20"
                              title="Delete Invite"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sent Emails Activity Log */}
        <div className="rounded-2xl border border-border bg-surface-card p-5 space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Send className="h-4 w-4 text-amber-400" />
            <span>Recent Tap-Bro Email Log (Delivered &amp; Dispatched)</span>
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
            {sentEmails.map((em, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/60 bg-surface p-2.5 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-semibold text-white">{em.subject}</div>
                  <div className="text-[11px] text-zinc-400">
                    To: {em.to} • Type: {em.type}
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {new Date(em.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
