/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { ToastMessage } from '../types';

interface NotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function Notification({ toasts, onDismiss }: NotificationProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg bg-white ${
                isSuccess
                  ? 'border-emerald-100 text-emerald-800'
                  : isError
                  ? 'border-rose-100 text-rose-800'
                  : isWarning
                  ? 'border-amber-100 text-amber-800'
                  : 'border-slate-100 text-slate-800'
              }`}
            >
              {/* Icon */}
              <div className="mt-0.5 shrink-0">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-500" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                {toast.type === 'info' && <Info className="w-5 h-5 text-sky-500" />}
              </div>

              {/* Message */}
              <div className="flex-1 text-sm font-medium pr-4 leading-relaxed font-sans">
                {toast.message}
              </div>

              {/* Close Button */}
              <button
                onClick={() => onDismiss(toast.id)}
                className="shrink-0 rounded-lg p-0.5 hover:bg-slate-50 transition-colors"
                id={`toast-close-${toast.id}`}
              >
                <X className="w-4 h-4 text-slate-400 hover:text-slate-600" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
