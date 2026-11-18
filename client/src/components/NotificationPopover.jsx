import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';

export const NotificationPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
        aria-label="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white shadow-2xl border border-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-slate-800">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[11px] bg-red-100 text-red-700 font-medium px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-88 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                No notifications right now
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => !n.isRead && markAsRead(n._id)}
                  className={`p-3.5 transition hover:bg-slate-50 flex gap-3 items-start cursor-pointer ${
                    !n.isRead ? 'bg-blue-50/30' : ''
                  }`}
                >
                  <span
                    className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                      !n.isRead ? 'bg-primary ring-2 ring-primary/20' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${!n.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">
                      {n.message}
                    </p>
                    <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(n.createdAt)}
                      </span>
                      {n.complaintId && (
                        <Link
                          to={`/complaints/${n.complaintId}`}
                          onClick={() => setIsOpen(false)}
                          className="text-primary hover:underline inline-flex items-center gap-0.5 font-medium"
                        >
                          View Case <ExternalLink className="w-2.5 h-2.5" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
