'use client'

import { cn } from '@/lib/utils';
import type { SprintStatus, TaskStatus, Priority, ApprovalStatus } from '@/lib/index';
import { STATUS_LABELS, PRIORITY_LABELS, APPROVAL_LABELS } from '@/lib/index';
import {
  CheckCircle2,
  Clock,
  Circle,
  // AlertTriangle,
  Minus,
  ChevronUp,
  CheckCheck,
  PauseCircle,
  XCircle,
} from 'lucide-react';

// ── Status Badge ──────────────────────────────────────────────

interface StatusBadgeProps {
  status: SprintStatus | TaskStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const baseClass = cn(
    'inline-flex items-center gap-1 rounded-full font-medium',
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
  );

  if (status === 'done') {
    return (
      <span className={cn(baseClass, 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25')}>
        <CheckCircle2 className="w-3 h-3" />
        {STATUS_LABELS[status]}
      </span>
    );
  }
  if (status === 'in-progress') {
    return (
      <span className={cn(baseClass, 'bg-accent/20 text-accent border border-accent/30')}>
        <Clock className="w-3 h-3 animate-pulse" />
        {STATUS_LABELS[status]}
      </span>
    );
  }
  return (
    <span className={cn(baseClass, 'bg-muted text-muted-foreground border border-border')}>
      <Circle className="w-3 h-3" />
      {STATUS_LABELS[status]}
    </span>
  );
}

// ── Priority Badge ────────────────────────────────────────────

interface PriorityBadgeProps {
  priority: Priority;
  size?: 'sm' | 'md';
}

export function PriorityBadge({ priority, size = 'md' }: PriorityBadgeProps) {
  const baseClass = cn(
    'inline-flex items-center gap-1 rounded-md font-medium',
    size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs'
  );

  if (priority === 'high') {
    return (
      <span className={cn(baseClass, 'bg-destructive/15 text-destructive border border-destructive/25')}>
        <ChevronUp className="w-3 h-3" />
        {PRIORITY_LABELS[priority]}
      </span>
    );
  }
  if (priority === 'medium') {
    return (
      <span className={cn(baseClass, 'bg-amber-500/15 text-amber-400 border border-amber-500/25')}>
        <Minus className="w-3 h-3" />
        {PRIORITY_LABELS[priority]}
      </span>
    );
  }
  return (
    <span className={cn(baseClass, 'bg-muted text-muted-foreground border border-border')}>
      <Minus className="w-3 h-3" />
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

// ── Tech Stack Tag ────────────────────────────────────────────

interface TechTagProps {
  name: string;
}

export function TechTag({ name }: TechTagProps) {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-mono bg-secondary/50 text-secondary-foreground border border-border/60">
      {name}
    </span>
  );
}

// ── Alert Banner ──────────────────────────────────────────────

interface AlertProps {
  icon: React.ReactNode;
  children: React.ReactNode;
  variant?: 'info' | 'warning' | 'danger';
}

export function Alert({ icon, children, variant = 'info' }: AlertProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 px-3 py-2 rounded-md text-xs border',
        variant === 'info' && 'bg-primary/10 text-primary border-primary/20',
        variant === 'warning' && 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        variant === 'danger' && 'bg-destructive/10 text-destructive border-destructive/20'
      )}
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

// ── Approval Badge ────────────────────────────────────────────

interface ApprovalBadgeProps {
  approval: ApprovalStatus;
  size?: 'sm' | 'md';
  onClick?: (e?: React.MouseEvent) => void;
}

export function ApprovalBadge({ approval, size = 'md', onClick }: ApprovalBadgeProps) {
  const baseClass = cn(
    'inline-flex items-center gap-1 rounded-md font-semibold border transition-all',
    size === 'sm' ? 'px-1.5 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
    onClick && 'cursor-pointer hover:opacity-80 active:scale-95'
  );

  if (approval === 'approved') {
    return (
      <span className={cn(baseClass, 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30')} onClick={onClick} title={onClick ? '클릭하여 승인 상태 변경' : undefined}>
        <CheckCheck className="w-3 h-3" />
        {APPROVAL_LABELS[approval]}
      </span>
    );
  }
  if (approval === 'pending') {
    return (
      <span className={cn(baseClass, 'bg-amber-500/15 text-amber-600 border-amber-500/30')} onClick={onClick} title={onClick ? '클릭하여 승인 상태 변경' : undefined}>
        <PauseCircle className="w-3 h-3" />
        {APPROVAL_LABELS[approval]}
      </span>
    );
  }
  // rejected
  return (
    <span className={cn(baseClass, 'bg-destructive/15 text-destructive border-destructive/30')} onClick={onClick} title={onClick ? '클릭하여 승인 상태 변경' : undefined}>
      <XCircle className="w-3 h-3" />
      {APPROVAL_LABELS[approval]}
    </span>
  );
}

// ── Progress Bar ──────────────────────────────────────────────

interface ProgressBarProps {
  value: number; // 0–100
  label?: string;
}

export function ProgressBar({ value, label }: ProgressBarProps) {
  return (
    <div className="space-y-1">
      {label && (
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      )}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            value === 100
              ? 'bg-emerald-500'
              : value > 0
              ? 'bg-primary'
              : 'bg-muted-foreground/20'
          )}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
