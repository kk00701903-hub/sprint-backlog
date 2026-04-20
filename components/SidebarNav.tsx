'use client'

import { SPRINTS } from '@/data/index';
import { StatusBadge } from '@/components/Badges';
import { cn } from '@/lib/utils';
import { ListTodo, LayoutGrid, FlaskConical } from 'lucide-react';

interface SidebarNavProps {
  activeSidebarId: string | null;
  onSidebarSelect: (id: string | null) => void;
  selectedSprintId?: string | null;
}

export function SidebarNav({ activeSidebarId, onSidebarSelect, selectedSprintId }: SidebarNavProps) {
  // 주요 스프린트 그룹 (Phase 0~3)
  const phaseGroups = [
    { phase: 'Phase 0', label: 'Phase 0 — 기반 인프라',    sprints: SPRINTS.filter((s) => s.phase === 'Phase 0') },
    { phase: 'Phase 1', label: 'Phase 1 — 인증/보안/권한', sprints: SPRINTS.filter((s) => s.phase === 'Phase 1') },
    { phase: 'Phase 2', label: 'Phase 2 — 아키텍처/공통',  sprints: SPRINTS.filter((s) => s.phase === 'Phase 2') },
    { phase: 'Phase 3', label: 'Phase 3 — 데이터/통합',    sprints: SPRINTS.filter((s) => s.phase === 'Phase 3') },
  ];

  // 추가과제 스프린트
  const additionalSprints = SPRINTS.filter((s) => s.category === 'additional');

  const mainSprints = SPRINTS.filter((s) => s.category !== 'additional');

  function SprintItem({ sprint }: { sprint: typeof SPRINTS[0] }) {
    const isActive = activeSidebarId === sprint.id;
    const hasDetail = selectedSprintId === sprint.id;
    return (
      <li>
        <button
          onClick={() => onSidebarSelect(isActive ? null : sprint.id)}
          className={cn(
            'w-full flex items-start gap-2 px-2 py-2 rounded-md text-left transition-all group',
            isActive
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
        >
          <span className="text-base shrink-0 mt-0.5">{sprint.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              <span className={cn(
                'text-[10px] font-mono px-1 py-0.5 rounded',
                isActive
                  ? 'bg-white/20 text-sidebar-primary-foreground'
                  : 'bg-primary/10 text-primary'
              )}>
                S{String(sprint.number).padStart(2, '0')}
              </span>
              {hasDetail && !isActive && (
                <span className="text-[9px] text-accent">●</span>
              )}
            </div>
            <p className="text-xs font-medium leading-snug whitespace-normal break-keep">
              {sprint.title}
            </p>
          </div>
          <div className="shrink-0 mt-0.5">
            <StatusBadge status={sprint.status} size="sm" />
          </div>
        </button>
      </li>
    );
  }

  return (
    <aside className="w-[375px] shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col h-full overflow-y-auto">
      {/* Brand */}
      <div className="px-4 py-4 border-b border-sidebar-border shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <ListTodo className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-sidebar-foreground">FaSS Backlog</p>
            <p className="text-[10px] text-muted-foreground font-mono">Sprint Planning v3.0</p>
            <p className="text-[10px] text-muted-foreground/60 font-mono">v1.0 · 2026-04-14 · 서선범</p>
          </div>
        </div>
      </div>

      {/* 전체 보기 버튼 */}
      <div className="px-3 pt-3 shrink-0">
        <button
          onClick={() => onSidebarSelect(null)}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-md text-left transition-all text-xs font-semibold',
            activeSidebarId === null
              ? 'bg-sidebar-primary text-sidebar-primary-foreground'
              : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
          )}
        >
          <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
          전체 스프린트 보기
          <span className="ml-auto text-[10px] opacity-70">{SPRINTS.length}개</span>
        </button>
      </div>

      {/* Nav — 주요 스프린트 */}
      <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
        {phaseGroups.map((group) => (
          group.sprints.length > 0 && (
            <div key={group.phase}>
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground px-1 mb-1.5">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.sprints.map((sprint) => (
                  <SprintItem key={sprint.id} sprint={sprint} />
                ))}
              </ul>
            </div>
          )
        ))}

        {/* ── 추가과제 구분선 ────────────────────────────── */}
        {additionalSprints.length > 0 && (
          <div>
            {/* 구분 헤더 */}
            <div className="flex items-center gap-2 px-1 mb-2 mt-1">
              <div className="flex-1 border-t border-dashed border-amber-500/40" />
              <div className="flex items-center gap-1.5 shrink-0">
                <FlaskConical className="w-3 h-3 text-amber-500" />
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-500">
                  추가 과제
                </span>
                <span className="text-[9px] text-amber-500/60 bg-amber-500/10 px-1.5 py-0.5 rounded-full border border-amber-500/20">
                  S{String(mainSprints.length + 1).padStart(2,'0')}~
                </span>
              </div>
              <div className="flex-1 border-t border-dashed border-amber-500/40" />
            </div>
            <ul className="space-y-0.5">
              {additionalSprints.map((sprint) => {
                const isActive = activeSidebarId === sprint.id;
                const hasDetail = selectedSprintId === sprint.id;
                return (
                  <li key={sprint.id}>
                    <button
                      onClick={() => onSidebarSelect(isActive ? null : sprint.id)}
                      className={cn(
                        'w-full flex items-start gap-2 px-2 py-2 rounded-md text-left transition-all group border',
                        isActive
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-700 dark:text-amber-300'
                          : 'border-amber-500/10 text-sidebar-foreground hover:bg-amber-500/8 hover:border-amber-500/25'
                      )}
                    >
                      <span className="text-base shrink-0 mt-0.5">{sprint.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className={cn(
                            'text-[10px] font-mono px-1 py-0.5 rounded',
                            isActive
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                              : 'bg-amber-500/10 text-amber-600'
                          )}>
                            S{String(sprint.number).padStart(2, '0')}
                          </span>
                          <span className="text-[9px] text-amber-500/70 bg-amber-500/10 px-1 rounded">
                            추가과제
                          </span>
                          {hasDetail && !isActive && (
                            <span className="text-[9px] text-accent">●</span>
                          )}
                        </div>
                        <p className="text-xs font-medium leading-snug whitespace-normal break-keep">
                          {sprint.title}
                        </p>
                      </div>
                      <div className="shrink-0 mt-0.5">
                        <StatusBadge status={sprint.status} size="sm" />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border shrink-0">
        <div className="flex justify-between items-center">
          <div>
          <p className="text-[10px] text-muted-foreground">© 2026 (주)제때 TFT팀</p>
          <p className="text-[10px] text-muted-foreground font-mono">FaSS Platform v3.0 &middot; 백로그 v1.0</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground">
              주요 <span className="text-foreground font-semibold">{mainSprints.length}</span>
              <span className="mx-1 text-muted-foreground/40">·</span>
              추가 <span className="text-amber-500 font-semibold">{additionalSprints.length}</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
