import React from 'react';

export default function Badge({
  children,
  variant = 'emerald', // 'emerald', 'blue', 'amber', 'red', 'slate', 'purple'
  size = 'md',        // 'sm', 'md'
  dot = false,
  className = ''
}) {
  const variantClasses = {
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    blue: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    amber: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
    slate: 'bg-slate-800 text-slate-300 border-slate-700',
    purple: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  };

  const dotClasses = {
    emerald: 'bg-emerald-400',
    blue: 'bg-blue-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
    slate: 'bg-slate-400',
    purple: 'bg-purple-400',
  };

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 font-bold',
    md: 'text-xs px-2.5 py-1 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-wide uppercase ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.emerald} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotClasses[variant] || 'bg-emerald-400'} animate-pulse`} />}
      {children}
    </span>
  );
}
