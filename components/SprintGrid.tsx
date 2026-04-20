'use client'

import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, springPresets } from '@/lib/motion';
import { SprintCard } from '@/components/SprintCard';
import { StatusBadge, PriorityBadge, ApprovalBadge } from '@/components/Badges';
import { useSprintProgress, useApprovalOverride, useAssigneeOverride } from '@/hooks/useSprintFilter';
import type { Sprint } from '@/lib/index';
import { LayoutGrid, List, ChevronRight, Clock, BookOpen, Users, FlaskConical } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// ── 리스트 행 컴포넌트 ────────────────────────────────────────

function SprintListRow({ sprint, isSelected, onClick }: {
  sprint: Sprint;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { taskProgress: progress } = useSprintProgress(sprint);
  const { getApproval, cycleApproval } = useApprovalOverride();
  const { getAssignees } = useAssigneeOverride();
  const approval = getApproval('sprint', sprint.id);
  const effAssignees = getAssignees(sprint.id, sprint.assignees ?? []);

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ x: 2 }}
      transition={springPresets.snappy}
      onClick={onClick}
      className={cn(
        'group flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all',
        isSelected
          ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
          : 'border-border bg-card hover:border-primary/30 hover:bg-muted/30'
      )}
    >
      {/* 번호 + 아이콘 */}
      <div className="flex items-center gap-2 shrink-0 w-16">
        <span className="text-xl">{sprint.icon}</span>
        <span className="text-[11px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/15">
          S{String(sprint.number).padStart(2, '0')}
        </span>
      </div>

      {/* 제목 + 부제 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {sprint.title}
          </span>
          <span className="text-[10px] text-muted-foreground border border-border px-1.5 py-0.5 rounded">
            {sprint.phase}
          </span>
        </div>
        <p className="text-xs text-muted-foreground font-mono truncate">{sprint.subtitle}</p>
        {/* 담당자 — override 반영 */}
        {effAssignees.length > 0 && (
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            <Users className="w-3 h-3 text-muted-foreground/60 shrink-0" />
            {effAssignees.map((a) => (
              <span key={a.name} className={cn(
                'text-[10px] px-1.5 py-0.5 rounded font-medium',
                a.role === 'TFT팀장' ? 'bg-primary/10 text-primary border border-primary/20' :
                a.role === 'PL' ? 'bg-amber-500/10 text-amber-600 border border-amber-500/20' :
                'bg-muted text-muted-foreground border border-border'
              )}>
                {a.name}
                <span className="opacity-60 ml-0.5">({a.role})</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 진행률 바 (좁게) */}
      <div className="hidden md:flex flex-col gap-1 w-28 shrink-0">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>진행률</span>
          <span className="font-mono">{progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all',
              progress === 100 ? 'bg-emerald-500' : progress > 0 ? 'bg-primary' : 'bg-muted-foreground/20'
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="hidden lg:flex flex-col items-end gap-1 shrink-0 w-28 text-right">
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
                <StatusBadge status={sprint.status} size="sm" />
                <PriorityBadge priority={sprint.priority} size="sm" />
                <ApprovalBadge approval={approval} size="sm" onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); cycleApproval('sprint', sprint.id, approval); }} />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{sprint.duration}</span>
          <span>{sprint.userStories.length}스토리</span>
        </div>
      </div>

      {/* 가이드 참조 */}
      <div className="hidden xl:flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 w-24">
        <BookOpen className="w-3 h-3 shrink-0" />
        <span className="truncate">{sprint.guideSection}</span>
      </div>

      {/* 화살표 */}
      <ChevronRight className={cn(
        'w-4 h-4 shrink-0 transition-all',
        isSelected ? 'text-primary rotate-90' : 'text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5'
      )} />
    </motion.div>
  );
}

// ── 메인 그리드/리스트 컴포넌트 ─────────────────────────────

interface SprintGridProps {
  sprints: Sprint[];
  selectedSprintId: string | null;
  onSelectSprint: (id: string | null) => void;
  defaultListView?: boolean; // true면 리스트뷰 기본
}

export function SprintGrid({ sprints, selectedSprintId, onSelectSprint, defaultListView = false }: SprintGridProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultListView ? 'list' : 'grid');

  // 주요 스프린트 / 추가과제 분리
  const mainSprints = sprints.filter((s) => s.category !== 'additional');
  const additionalSprints = sprints.filter((s) => s.category === 'additional');

  function renderItem(sprint: Sprint) {
    return viewMode === 'list' ? (
      <SprintListRow
        key={sprint.id}
        sprint={sprint}
        isSelected={selectedSprintId === sprint.id}
        onClick={() => onSelectSprint(selectedSprintId === sprint.id ? null : sprint.id)}
      />
    ) : (
      <SprintCard
        key={sprint.id}
        sprint={sprint}
        isSelected={selectedSprintId === sprint.id}
        onClick={() => onSelectSprint(selectedSprintId === sprint.id ? null : sprint.id)}
      />
    );
  }

  if (sprints.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <span className="text-4xl mb-3">🔍</span>
        <p className="text-sm font-medium text-foreground">검색 결과가 없습니다</p>
        <p className="text-xs text-muted-foreground mt-1">필터 조건을 변경해 보세요</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 상단 바 */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          <span className="text-foreground font-semibold">{mainSprints.length}</span>개 주요 스프린트
          {additionalSprints.length > 0 && (
            <span className="ml-2 text-amber-500">
              + 추가과제 <span className="font-semibold">{additionalSprints.length}</span>개
            </span>
          )}
        </p>
        <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 주요 스프린트 목록 */}
      {mainSprints.length > 0 && (
        <motion.div
          key={`main-${viewMode}`}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex flex-col gap-2'}
        >
          {mainSprints.map(renderItem)}
        </motion.div>
      )}

      {/* 추가과제 구분선 + 목록 */}
      {additionalSprints.length > 0 && (
        <div className="space-y-2 pt-2">
          {/* 구분 헤더 */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-dashed border-amber-500/40" />
            <div className="flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-lg bg-amber-500/8 border border-amber-500/20">
              <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-amber-500 tracking-wide">추가 과제</span>
              <span className="text-[10px] text-amber-500/60 ml-1">S{String(additionalSprints[0].number).padStart(2,'0')}~S{String(additionalSprints[additionalSprints.length-1].number).padStart(2,'0')}</span>
            </div>
            <div className="flex-1 border-t border-dashed border-amber-500/40" />
          </div>
          <p className="text-[11px] text-amber-500/70 text-center">
            본 스프린트는 기본 로드맵 외 선택적으로 진행하는 확장 과제입니다.
          </p>

          <motion.div
            key={`add-${viewMode}`}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className={cn(
              'rounded-xl border border-dashed border-amber-500/25 bg-amber-500/[0.03] p-3',
              viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'flex flex-col gap-2'
            )}
          >
            {additionalSprints.map(renderItem)}
          </motion.div>
        </div>
      )}
    </div>
  );
}
