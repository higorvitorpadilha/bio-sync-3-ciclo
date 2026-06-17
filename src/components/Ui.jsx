import React from 'react';

export function PageShell({ title, subtitle, actions, children }) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-950">{title}</h1>
          {subtitle && <p className="mt-2 max-w-3xl text-slate-600">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
      {children}
    </main>
  );
}

export function LoadingState({ label = 'Carregando dados...' }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-6 text-center text-slate-600">
      {label}
    </div>
  );
}

export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      {description && <p className="mt-2 text-slate-600">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Alert({ type = 'info', children }) {
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    success: 'border-green-200 bg-green-50 text-green-900',
    error: 'border-red-200 bg-red-50 text-red-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
  };

  return <div className={`rounded-md border p-3 text-sm ${styles[type]}`}>{children}</div>;
}

export function StatusBadge({ status }) {
  const labels = {
    approved: 'Aprovado',
    pending: 'Pendente',
    rejected: 'Reprovado',
    open: 'Aberto',
    assigned: 'Aceito',
    completed: 'Concluido',
  };
  const styles = {
    approved: 'bg-green-100 text-green-800',
    pending: 'bg-amber-100 text-amber-800',
    rejected: 'bg-red-100 text-red-800',
    open: 'bg-blue-100 text-blue-800',
    assigned: 'bg-purple-100 text-purple-800',
    completed: 'bg-slate-100 text-slate-800',
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.completed}`}>
      {labels[status] || status}
    </span>
  );
}
