'use client'

import { motion } from 'framer-motion';
import { springPresets, staggerItem } from '@/lib/motion';
import { StatusBadge, PriorityBadge, TechTag, ProgressBar, ApprovalBadge } from '@/components/Badges';
import { calcStoryPoints } from '@/data/index';
import type { Sprint } from '@/lib/index';
import { ChevronRight, BookOpen, Clock, User, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStatusOverride, useSprintProgress, useApprovalOverride } from '@/hooks/useSprintFilter';

interface SprintCardProps {
  sprint: Sprint;
  isSelected: boolean;
  onClick: () => void;
}

export function SprintCard({ sprint, isSelected, onClick }: SprintCardProps) {
  const { taskProgress: progress } = useSprintProgress(sprint);
  const sp = calcStoryPoints(sprint);
  const { getSprintStatus, cycleSprintStatus } = useStatusOverride();
  const { getApproval, cycleApproval } = useApprovalOverride();
  const sprintStatus = getSprintStatus(sprint.id, sprint.status);
  const approval = getApproval('sprint', sprint.id);

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.005 }}
      whileTap={{ scale: 0.998 }}
      transition={springPresets.snappy}
      onClick={onClick}
      className={cn(
        'relative group cursor-pointer rounded-xl border p-4 transition-all',
        'bg-card hover:bg-card/80',
        isSelected
          ? 'border-primary ring-1 ring-primary/30 shadow-[0_0_20px_-4px] shadow-primary/20'
          : 'border-border hover:border-primary/40 hover:shadow-md'
      )}
    >
      {/* Sprint number + phase */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{sprint.icon}</span>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
                S{String(sprint.number).padStart(2, '0')}
              </span>
              <span className="text-[11px] text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                {sprint.phase}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
            <button onClick={(e) => { e.stopPropagation(); cycleSprintStatus(sprint.id, sprintStatus); }} title="클릭하여 상태 변경" className="hover:opacity-80 transition-opacity">
              <StatusBadge status={sprintStatus} size="sm" />
            </button>
          <PriorityBadge priority={sprint.priority} size="sm" />
          <ApprovalBadge approval={approval} size="sm" onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); cycleApproval('sprint', sprint.id, approval); }} />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-foreground leading-tight mb-0.5 group-hover:text-primary transition-colors">
        {sprint.title}
      </h3>
      <p className="text-[11px] text-muted-foreground font-mono mb-2">{sprint.subtitle}</p>

      {/* Sprint Goal (one-liner) */}
      <div className="flex items-start gap-1.5 mb-3 px-2 py-1.5 rounded-md bg-primary/5 border border-primary/10">
        <Flag className="w-3 h-3 text-primary/60 mt-0.5 shrink-0" />
        <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
          {sprint.goal.summary}
        </p>
      </div>

      {/* Progress */}
      <ProgressBar value={progress} />

      {/* Stats row */}
      <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <User className="w-3 h-3" />
          {sprint.userStories.length}개 스토리
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {sprint.duration}
        </span>
        <span className="font-mono text-primary/70">{sp.total}pts</span>
        <span className="flex items-center gap-1 ml-auto">
          <BookOpen className="w-3 h-3" />
          {sprint.guideSection}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/50">
        {/* Tech tags */}
        <div className="flex flex-wrap gap-1">
          {sprint.techStack.slice(0, 3).map((tech) => (
            <TechTag key={tech} name={tech} />
          ))}
          {sprint.techStack.length > 3 && (
            <span className="text-[11px] text-muted-foreground">+{sprint.techStack.length - 3}</span>
          )}
        </div>
        <ChevronRight
          className={cn(
            'w-4 h-4 transition-all shrink-0',
            isSelected
              ? 'text-primary rotate-90'
              : 'text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5'
          )}
        />
      </div>
    </motion.div>
  );
}
