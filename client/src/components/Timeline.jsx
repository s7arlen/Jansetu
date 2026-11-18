import React from 'react';
import {
  CheckCircle,
  Clock,
  ArrowRight,
  Shield,
  FileText,
  ExternalLink,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';

export const Timeline = ({ history = [], currentStatus = '' }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flow-root">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          Audit Trail & Progression History
        </h4>
        <span className="text-xs text-slate-500 font-mono">
          {history.length} record{history.length === 1 ? '' : 's'}
        </span>
      </div>

      <ul className="-mb-8">
        {history.map((item, idx) => {
          const isLast = idx === history.length - 1;

          return (
            <li key={item._id || idx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-200"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3 items-start">
                  <div>
                    <span
                      className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                        isLast
                          ? 'bg-primary text-white shadow-md'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isLast ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {item.previousStatus && (
                          <>
                            <span className="text-xs text-slate-400">From</span>
                            <StatusBadge status={item.previousStatus} size="sm" />
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </>
                        )}
                        <StatusBadge status={item.newStatus} size="sm" />
                      </div>

                      {item.remarks && (
                        <p className="text-sm text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2 font-sans">
                          {item.remarks}
                        </p>
                      )}

                      {item.evidence && (
                        <div className="mt-2">
                          <a
                            href={item.evidence}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-primary font-medium hover:underline bg-blue-50/60 px-2 py-1 rounded"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            View Attached Evidence Image
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1 font-medium text-slate-600">
                          <Shield className="w-3 h-3 text-slate-400" />
                          {item.updatedBy?.name || 'Authorized Official'}
                          <span className="capitalize text-slate-400">
                            ({item.updaterRole || item.updatedBy?.role || 'Staff'})
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="whitespace-nowrap text-right text-xs text-slate-400 font-mono">
                      {formatDate(item.timestamp)}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
