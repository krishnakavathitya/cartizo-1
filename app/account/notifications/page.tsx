'use client';

import { useState } from 'react';
import { Bell, Package, Tag, Heart, Trash2, CheckCircle2, Shield, Zap } from 'lucide-react';

interface Notification {
  id: string;
  type: 'order' | 'offer' | 'wishlist' | 'general';
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'order',
      title: 'Acquisition Finalized',
      message: 'Your manifest #ORD-2024-001 has been successfully delivered at the designated base.',
      date: '2024-02-15T10:30:00',
      read: false,
    },
    {
      id: '2',
      type: 'offer',
      title: 'Tier Progression Alert',
      message: 'Flash sale protocol initialized. Up to 50% valuation adjustment on Electronics. TTL: 2 hours.',
      date: '2024-02-14T15:00:00',
      read: false,
    },
    {
      id: '3',
      type: 'wishlist',
      title: 'Valuation Adjustment',
      message: 'Sony WH-1000XM5 from your curation has experienced a negative valuation shift of ₹2,000.',
      date: '2024-02-13T09:00:00',
      read: true,
    },
    {
      id: '4',
      type: 'order',
      title: 'Logistical Dispatch',
      message: 'Manifest #ORD-2024-002 has entered the transit stream. Estimated intercept: 72 hours.',
      date: '2024-02-12T14:20:00',
      read: true,
    },
  ]);

  const getIconConfig = (type: string) => {
    switch (type) {
      case 'order':
        return { icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50', label: 'Operational' };
      case 'offer':
        return { icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Opportunity' };
      case 'wishlist':
        return { icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Curation' };
      default:
        return { icon: Bell, color: 'text-slate-500', bg: 'bg-slate-50', label: 'System' };
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const handleDelete = (id: string) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  const handleClearAll = () => {
    if (confirm('Are you certain you wish to purge all signal history?')) {
      setNotifications([]);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-display font-black text-slate-900 tracking-tight leading-none mb-4">Signal Stream</h1>
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
            Real-time feed of system and acquisition events
          </p>
        </div>
        <div className="flex gap-3">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100 shadow-sm"
            >
              Verify All
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-6 py-3 border border-rose-100 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all shadow-sm"
            >
              Purge All
            </button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {notifications.map((notification) => {
          const config = getIconConfig(notification.type);
          return (
            <div
              key={notification.id}
              className={`group relative bg-white border border-gray-100 rounded-[2.5rem] p-8 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500 ${!notification.read ? 'ring-2 ring-indigo-500/10' : ''}`}
            >
              {!notification.read && (
                <div className="absolute top-8 right-8 w-2 h-2 bg-indigo-600 rounded-full animate-ping"></div>
              )}

              <div className="flex flex-col sm:flex-row gap-8">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-500 ${config.bg} ${config.color} border border-current/10`}>
                  <config.icon className="w-8 h-8" strokeWidth={1.5} />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-4">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${config.bg} ${config.color}`}>{config.label}</span>
                      <h3 className={`text-xl font-display font-black text-slate-900 ${!notification.read ? 'text-slate-900 underline decoration-indigo-200 decoration-4 underline-offset-4' : 'text-slate-700'}`}>{notification.title}</h3>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-lg">{formatDate(notification.date)}</p>
                  </div>

                  <p className="text-slate-600 font-medium leading-relaxed mb-6 group-hover:text-slate-900 transition-colors">
                    {notification.message}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex gap-6">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 flex items-center gap-2 group/btn"
                        >
                          <CheckCircle2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                          Verify Event
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-500 flex items-center gap-2 group/btn"
                      >
                        <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        Acknowledge & Clear
                      </button>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <Shield className="w-3 h-3" />
                      Encrypted Signal
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {notifications.length === 0 && (
        <div className="text-center py-32 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-100">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-sm">
            <Bell className="w-10 h-10 text-slate-200" strokeWidth={1.5} />
            <div className="absolute top-0 right-0 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white"></div>
          </div>
          <h3 className="text-2xl font-display font-black text-slate-900 mb-2">Passive State</h3>
          <p className="text-slate-500 max-w-xs mx-auto mb-8 font-medium">The alert buffer is currently clear. No high-priority events detected.</p>
        </div>
      )}
    </div>
  );
}
