'use client'

import { Search, Filter, X, User } from 'lucide-react';
import type { SprintStatus, Priority, SprintFilter } from '@/lib/index';
import { PHASE_OPTIONS, TEAM_MEMBERS } from '@/lib/index';

interface FilterBarProps {
  filter: SprintFilter;
  onStatusChange: (s: SprintStatus | 'all') => void;
  onPriorityChange: (p: Priority | 'all') => void;
  onPhaseChange: (ph: string) => void;
  onSearchChange: (q: string) => void;
  onAssigneeChange: (name: string) => void;
  resultCount: number;
}

type FilterButtonProps = {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  activeClass?: string;
};

function FilterButton({ active, onClick, children, activeClass = 'bg-primary text-primary-foreground' }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
        active
          ? activeClass
          : 'bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground border border-border'
      }`}
    >
      {children}
    </button>
  );
}

export function FilterBar({
  filter,
  onStatusChange,
  onPriorityChange,
  onPhaseChange,
  onSearchChange,
  onAssigneeChange,
  resultCount,
}: FilterBarProps) {
  const { status: statusFilter, priority: priorityFilter, phase: phaseFilter, search: searchQuery, assignee: assigneeFilter } = filter;

  const hasFilter =
    statusFilter !== 'all' ||
    priorityFilter !== 'all' ||
    phaseFilter !== 'all' ||
    assigneeFilter !== 'all' ||
    searchQuery.length > 0;

  const clearAll = () => {
    onStatusChange('all');
    onPriorityChange('all');
    onPhaseChange('all');
    onSearchChange('');
    onAssigneeChange('all');
  };

  return (
    <div className="space-y-3 p-4 bg-card border border-border rounded-xl">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          type="text"
          placeholder="스프린트 이름, 기술 스택 검색..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-8 pr-8 py-2 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Status */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            <Filter className="w-3 h-3" /> 상태
          </span>
          <FilterButton active={statusFilter === 'all'} onClick={() => onStatusChange('all')}>전체</FilterButton>
          <FilterButton
            active={statusFilter === 'todo'}
            onClick={() => onStatusChange('todo')}
          >
            TODO
          </FilterButton>
          <FilterButton
            active={statusFilter === 'in-progress'}
            onClick={() => onStatusChange('in-progress')}
            activeClass="bg-accent text-accent-foreground"
          >
            진행 중
          </FilterButton>
          <FilterButton
            active={statusFilter === 'done'}
            onClick={() => onStatusChange('done')}
            activeClass="bg-emerald-500 text-white"
          >
            완료
          </FilterButton>
        </div>

        {/* Priority */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground font-medium">우선순위</span>
          <FilterButton active={priorityFilter === 'all'} onClick={() => onPriorityChange('all')}>전체</FilterButton>
          <FilterButton
            active={priorityFilter === 'high'}
            onClick={() => onPriorityChange('high')}
            activeClass="bg-destructive text-destructive-foreground"
          >
            높음
          </FilterButton>
          <FilterButton
            active={priorityFilter === 'medium'}
            onClick={() => onPriorityChange('medium')}
            activeClass="bg-amber-500 text-white"
          >
            중간
          </FilterButton>
          <FilterButton active={priorityFilter === 'low'} onClick={() => onPriorityChange('low')}>낮음</FilterButton>
        </div>

        {/* Phase */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground font-medium">Phase</span>
          {PHASE_OPTIONS.map((opt) => (
            <FilterButton
              key={opt.value}
              active={phaseFilter === opt.value}
              onClick={() => onPhaseChange(opt.value)}
            >
              {opt.label}
            </FilterButton>
          ))}
        </div>

        {/* 담당자 필터 */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            <User className="w-3 h-3" /> 담당자
          </span>
          <FilterButton active={assigneeFilter === 'all'} onClick={() => onAssigneeChange('all')}>전체</FilterButton>
          {TEAM_MEMBERS.map((m) => (
            <FilterButton
              key={m.name}
              active={assigneeFilter === m.name}
              onClick={() => onAssigneeChange(m.name)}
              activeClass={
                m.role === 'TFT팀장' ? 'bg-primary text-primary-foreground' :
                m.role === 'PL' ? 'bg-amber-500 text-white' :
                'bg-secondary text-secondary-foreground border-secondary'
              }
            >
              {m.name}
            </FilterButton>
          ))}
        </div>
      </div>

      {/* Result & Clear */}
      <div className="flex items-center justify-between pt-1 border-t border-border/50">
        <span className="text-xs text-muted-foreground">
          <span className="text-foreground font-semibold">{resultCount}</span>개 스프린트
        </span>
        {hasFilter && (
          <button
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors"
          >
            <X className="w-3 h-3" />
            필터 초기화
          </button>
        )}
      </div>
    </div>
  );
}
