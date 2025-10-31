import React from 'react';
import { Spinner } from './spinner';

type Props = {
  show?: boolean;
  message?: React.ReactNode;
};

const GlobalLoader: React.FC<Props> = ({ show = false, message = 'Loading...' }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3">
        <Spinner />
        <div className="text-sm text-slate-900 dark:text-slate-100">{message}</div>
      </div>
    </div>
  );
};

export default GlobalLoader;
