'use client'

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { springPresets } from '@/lib/motion';
import { StatusBadge, PriorityBadge, TechTag, ProgressBar, ApprovalBadge } from '@/components/Badges';
import type { Sprint, UserStory, Task, DetailTab, OssDetail } from '@/lib/index';
import { DETAIL_TABS } from '@/lib/index';
import { calcStoryPoints } from '@/data/index';
import {
  X, BookOpen, Clock, Flag,
  ChevronDown, ChevronRight, CheckSquare,
  User, ArrowRight, AlertCircle, Sparkles,
  ListChecks, Zap, Circle, CheckCircle2,
  Package, ExternalLink, Settings, ShieldAlert,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStatusOverride, useSprintProgress, useApprovalOverride } from '@/hooks/useSprintFilter';
import { AssigneeEditor } from '@/components/AssigneeEditor';

// ── Sub-components ────────────────────────────────────────────

function SubTaskRow({ subTask }: { subTask: NonNullable<Task['subTasks']>[number] }) {
  const { getSubTaskStatus, cycleSubTaskStatus } = useStatusOverride();
  const status = getSubTaskStatus(subTask.id, subTask.status as import('@/lib/index').TaskStatus);
  return (
    <div className="flex items-center gap-2 py-1 pl-6 text-xs text-muted-foreground">
      <button onClick={() => cycleSubTaskStatus(subTask.id, status)} className="shrink-0 hover:scale-110 transition-transform">
        {status === 'done' ? (
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        ) : status === 'in-progress' ? (
          <Circle className="w-3.5 h-3.5 text-accent" />
        ) : (
          <Circle className="w-3.5 h-3.5 text-muted-foreground/40" />
        )}
      </button>
      <span className={cn(status === 'done' && 'line-through opacity-60')}>{subTask.title}</span>
    </div>
  );
}

function TaskItem({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);
  const { getTaskStatus, cycleTaskStatus } = useStatusOverride();
  const { getApproval, cycleApproval } = useApprovalOverride();
  const status = getTaskStatus(task.id, task.status);
  const approval = getApproval('task', task.id);
  const hasSubs = task.subTasks && task.subTasks.length > 0;

  return (
    <div className="rounded-lg border border-border/60 bg-muted/30 overflow-hidden hover:border-border transition-all">
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={() => cycleTaskStatus(task.id, status)}
          className="mt-0.5 shrink-0 hover:opacity-80 transition-opacity"
          title="클릭하여 상태 변경 (TODO → 진행중 → 완료)"
        >
          <StatusBadge status={status} size="sm" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p className="text-sm font-medium text-foreground">{task.title}</p>
            <div className="flex items-center gap-1.5 shrink-0">
              <ApprovalBadge approval={approval} size="sm" onClick={() => cycleApproval('task', task.id, approval)} />
              <PriorityBadge priority={task.priority} size="sm" />
              {task.estimatedDays && (
                <span className="text-[11px] text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                  {task.estimatedDays}일
                </span>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{task.description}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {task.assigneeRole && (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <User className="w-3 h-3" />{task.assigneeRole}
              </span>
            )}
            {task.techStack?.map((t) => <TechTag key={t} name={t} />)}
            {task.guideRef && (
              <span className="text-[11px] text-primary/70 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />{task.guideRef}
              </span>
            )}
            {hasSubs && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="text-[11px] text-muted-foreground ml-auto flex items-center gap-1"
              >
                서브태스크 {task.subTasks!.filter(s => s.status === 'done').length}/{task.subTasks!.length}
                {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
      </div>
      {hasSubs && expanded && (
        <div className="border-t border-border/40 py-1 bg-muted/20">
          {task.subTasks!.map((sub) => <SubTaskRow key={sub.id} subTask={sub} />)}
        </div>
      )}
    </div>
  );
}

function UserStoryCard({ story }: { story: UserStory }) {
  const [expanded, setExpanded] = useState(false);
  const { getStoryStatus, cycleStoryStatus } = useStatusOverride();
  const { getApproval, cycleApproval } = useApprovalOverride();
  const storyStatus = getStoryStatus(story.id, story.status);
  const approval = getApproval('story', story.id);

  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      {/* Header — always visible */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-all"
      >
        <div className="mt-0.5 shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center border border-primary/20">
          US
        </div>
        <div className="flex-1 min-w-0">
          {/* Story narrative */}
          <p className="text-sm font-semibold text-foreground mb-0.5">
            <span className="text-primary">As a</span> {story.asA},{' '}
            <span className="text-primary">I want to</span> {story.iWantTo}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="text-accent">So that</span> {story.soThat}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button onClick={(e) => { e.stopPropagation(); cycleStoryStatus(story.id, storyStatus); }} title="클릭하여 상태 변경" className="hover:opacity-80 transition-opacity">
              <StatusBadge status={storyStatus} size="sm" />
            </button>
            <ApprovalBadge approval={approval} size="sm" onClick={(e?: React.MouseEvent) => { e?.stopPropagation(); cycleApproval('story', story.id, approval); }} />
            <PriorityBadge priority={story.priority} size="sm" />
            {story.storyPoints && (
              <span className="text-[11px] font-mono text-muted-foreground border border-border px-1.5 py-0.5 rounded">
                {story.storyPoints} pts
              </span>
            )}
            <span className="ml-auto text-[11px] text-muted-foreground">
              {story.tasks.filter((t) => t.status === 'done').length}/{story.tasks.length} 태스크
              {expanded ? <ChevronDown className="w-3 h-3 inline ml-1" /> : <ChevronRight className="w-3 h-3 inline ml-1" />}
            </span>
          </div>
        </div>
      </button>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={springPresets.gentle}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-border/40 space-y-4">
              {/* AS-IS / TO-BE */}
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-lg p-3 bg-destructive/8 border border-destructive/20">
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-destructive">
                    <AlertCircle className="w-3.5 h-3.5" />
                    AS-IS (현재 문제)
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{story.asBefore}</p>
                </div>
                <div className="rounded-lg p-3 bg-emerald-500/8 border border-emerald-500/20">
                  <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                    TO-BE (목표 상태)
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{story.toBe}</p>
                </div>
              </div>

              {/* Acceptance Criteria */}
              <div>
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <CheckSquare className="w-3.5 h-3.5 text-primary" />
                  완료 기준 (Acceptance Criteria)
                </p>
                <ul className="space-y-1.5">
                  {story.acceptanceCriteria.map((ac, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="mt-0.5 w-4 h-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 border border-primary/20">
                        {i + 1}
                      </span>
                      {ac}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tasks */}
              <div>
                <p className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                  <ListChecks className="w-3.5 h-3.5 text-primary" />
                  태스크 ({story.tasks.length})
                </p>
                <div className="space-y-2">
                  {story.tasks.map((task) => <TaskItem key={task.id} task={task} />)}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── OSS Detail Tab ────────────────────────────────────────────

function OssCard({ oss }: { oss: OssDetail }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
      <button onClick={() => setExpanded(v => !v)} className="w-full flex items-start gap-3 p-4 text-left hover:bg-muted/30 transition-all">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Package className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-foreground">{oss.name}</span>
            {oss.version && <span className="text-[11px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">{oss.version}</span>}
            {expanded ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-auto" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />}
          </div>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{oss.role}</p>
        </div>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={springPresets.gentle} className="overflow-hidden">
            <div className="px-4 pb-4 space-y-4 border-t border-border/40">
              {/* Why */}
              <div className="pt-3">
                <p className="text-[11px] font-semibold text-accent uppercase tracking-wide mb-1.5 flex items-center gap-1"><Sparkles className="w-3 h-3" />선택 이유</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{oss.why}</p>
              </div>
              {/* Setup Steps */}
              <div>
                <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-1"><Settings className="w-3 h-3" />설정·설치 단계</p>
                <ol className="space-y-1.5">
                  {oss.setupSteps.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center border border-primary/20">{i + 1}</span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              {/* Key Config */}
              {oss.keyConfig && (
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1"><ExternalLink className="w-3 h-3" />핵심 설정값</p>
                  <code className="block text-[11px] font-mono bg-muted/80 border border-border px-3 py-2 rounded-lg text-foreground leading-relaxed break-all">{oss.keyConfig}</code>
                </div>
              )}
              {/* Pitfalls */}
              {oss.pitfalls && oss.pitfalls.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-destructive uppercase tracking-wide mb-2 flex items-center gap-1"><ShieldAlert className="w-3 h-3" />주의사항 / 흔한 실수</p>
                  <ul className="space-y-1.5">
                    {oss.pitfalls.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* References */}
              {oss.references && oss.references.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1"><BookOpen className="w-3 h-3" />가이드 참조</p>
                  <div className="flex flex-wrap gap-1.5">
                    {oss.references.map((ref, i) => <span key={i} className="text-[11px] text-primary/80 bg-primary/5 px-2 py-0.5 rounded border border-primary/15">{ref}</span>)}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OssTab({ sprint }: { sprint: Sprint }) {
  if (!sprint.ossDetails || sprint.ossDetails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Package className="w-10 h-10 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground">이 스프린트에는 OSS 상세 정보가 없습니다</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">오픈소스 <span className="text-foreground font-semibold">{sprint.ossDetails.length}</span>개 · 각 항목을 클릭해 세부 진행방향을 확인하세요</p>
      {sprint.ossDetails.map(oss => <OssCard key={oss.name} oss={oss} />)}
    </div>
  );
}

// ── Goal Tab ──────────────────────────────────────────────────

function GoalTab({ sprint }: { sprint: Sprint }) {
  const sp = calcStoryPoints(sprint);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="rounded-xl p-4 bg-primary/8 border border-primary/20">
        <div className="flex items-center gap-2 mb-2">
          <Flag className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">스프린트 목표</span>
        </div>
        <p className="text-sm text-foreground font-medium leading-relaxed">
          &quot;{sprint.goal.summary}&quot;
        </p>
      </div>

      {/* AS-IS Problem */}
      <div className="rounded-xl p-4 bg-destructive/8 border border-destructive/20 space-y-1.5">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-destructive" />
          <span className="text-xs font-semibold text-destructive uppercase tracking-wide">AS-IS — 해결할 문제</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{sprint.goal.problem}</p>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <ArrowRight className="w-5 h-5 text-muted-foreground/40" />
      </div>

      {/* TO-BE Objective */}
      <div className="rounded-xl p-4 bg-emerald-500/8 border border-emerald-500/20 space-y-1.5">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">TO-BE — 달성 목표</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{sprint.goal.objective}</p>
      </div>

      {/* Deliverables */}
      <div className="rounded-xl p-4 bg-card border border-border space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <CheckSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">주요 산출물</span>
        </div>
        <ul className="space-y-2">
          {sprint.goal.deliverables.map((d, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
              <span className="mt-0.5 w-4 h-4 rounded-sm bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              {d}
            </li>
          ))}
        </ul>
      </div>

      {/* Dependencies */}
      {sprint.goal.dependencies && sprint.goal.dependencies.length > 0 && (
        <div className="rounded-xl p-4 bg-amber-500/8 border border-amber-500/20 space-y-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-semibold text-amber-400">선행 의존성</span>
          </div>
          <ul className="space-y-1">
            {sprint.goal.dependencies.map((dep, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                <ChevronRight className="w-3 h-3 text-amber-400/60" />
                {dep}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Story Points Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: '유저스토리', value: sprint.userStories.length, sub: '개' },
          { label: '스토리 포인트', value: sp.total, sub: 'pts' },
          { label: '완료 포인트', value: sp.done, sub: 'pts' },
        ].map((item) => (
          <div key={item.label} className="rounded-lg p-3 bg-muted/50 border border-border text-center">
            <p className="text-xl font-bold text-primary">{item.value}<span className="text-xs font-normal text-muted-foreground ml-0.5">{item.sub}</span></p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── User Story Tab ────────────────────────────────────────────

function UserStoryTab({ sprint }: { sprint: Sprint }) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        유저스토리 <span className="text-foreground font-semibold">{sprint.userStories.length}</span>개 ·
        스토리 포인트 합계 <span className="text-foreground font-semibold">{sprint.userStories.reduce((s, us) => s + (us.storyPoints ?? 0), 0)}</span>pts
      </p>
      {sprint.userStories.map((story) => (
        <UserStoryCard key={story.id} story={story} />
      ))}
    </div>
  );
}

// ── Task Tab ──────────────────────────────────────────────────

function TaskTab({ sprint }: { sprint: Sprint }) {
  const allTasks = sprint.userStories.flatMap((us) =>
    us.tasks.map((t) => ({ ...t, storyTitle: us.asA + ' → ' + us.iWantTo.slice(0, 30) + '…' }))
  );
  const grouped = {
    'in-progress': allTasks.filter((t) => t.status === 'in-progress'),
    'todo': allTasks.filter((t) => t.status === 'todo'),
    'done': allTasks.filter((t) => t.status === 'done'),
  };

  const totalDays = allTasks.reduce((s, t) => s + (t.estimatedDays ?? 0), 0);

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: '전체', value: allTasks.length, color: 'text-foreground' },
          { label: '진행 중', value: grouped['in-progress'].length, color: 'text-accent' },
          { label: 'TODO', value: grouped['todo'].length, color: 'text-muted-foreground' },
          { label: '완료', value: grouped['done'].length, color: 'text-emerald-400' },
        ].map((item) => (
          <div key={item.label} className="rounded-lg p-2 bg-muted/50 border border-border text-center">
            <p className={cn('text-lg font-bold', item.color)}>{item.value}</p>
            <p className="text-[10px] text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">총 예상 작업일: <span className="text-foreground font-semibold">{totalDays}일</span></p>

      {/* In-progress first */}
      {grouped['in-progress'].length > 0 && (
        <div>
          <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" /> 진행 중 ({grouped['in-progress'].length})
          </p>
          <div className="space-y-2">{grouped['in-progress'].map((t) => <TaskItem key={t.id} task={t} />)}</div>
        </div>
      )}
      {grouped['todo'].length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-muted-foreground/40" /> TODO ({grouped['todo'].length})
          </p>
          <div className="space-y-2">{grouped['todo'].map((t) => <TaskItem key={t.id} task={t} />)}</div>
        </div>
      )}
      {grouped['done'].length > 0 && (
        <div>
          <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" /> 완료 ({grouped['done'].length})
          </p>
          <div className="space-y-2">{grouped['done'].map((t) => <TaskItem key={t.id} task={t} />)}</div>
        </div>
      )}
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────

interface SprintDetailPanelProps {
  sprint: Sprint | null;
  onClose: () => void;
}

export function SprintDetailPanel({ sprint, onClose }: SprintDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>('목표');
  const { getSprintStatus, cycleSprintStatus } = useStatusOverride();
  const { getApproval, cycleApproval } = useApprovalOverride();
  const sprintStatus = getSprintStatus(sprint?.id ?? '', sprint?.status ?? 'todo');
  const sprintApproval = getApproval('sprint', sprint?.id ?? '');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { taskProgress: progress, taskDone, taskTotal } = useSprintProgress(sprint as any);

  if (!sprint) return null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sprint.id}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 24 }}
        transition={springPresets.gentle}
        className="flex flex-col h-full bg-card border border-border rounded-xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-3xl shrink-0">{sprint.icon}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                    Sprint {String(sprint.number).padStart(2, '0')}
                  </span>
                  <span className="text-xs text-muted-foreground border border-border px-2 py-0.5 rounded">
                    {sprint.phase}
                  </span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {sprint.duration}
                  </span>
                </div>
                <h2 className="text-base font-bold text-foreground leading-tight truncate">{sprint.title}</h2>
                <p className="text-xs font-mono text-muted-foreground">{sprint.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-all shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Status + Progress */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <button onClick={() => cycleSprintStatus(sprint.id, sprintStatus)} title="클릭하여 상태 변경" className="hover:opacity-80 transition-opacity">
              <StatusBadge status={sprintStatus} />
            </button>
            <PriorityBadge priority={sprint.priority} />
            <ApprovalBadge approval={sprintApproval} onClick={() => cycleApproval('sprint', sprint.id, sprintApproval)} />
            <span className="text-xs text-muted-foreground flex items-center gap-1 ml-auto">
              <BookOpen className="w-3.5 h-3.5" />{sprint.guideSection}
            </span>
          </div>
          {/* 담당자 — 편집 가능 */}
          <div className="mt-2">
            <AssigneeEditor sprintId={sprint.id} currentAssignees={sprint.assignees ?? []} />
          </div>
          <div className="mt-3">
            <ProgressBar value={progress} label={`태스크 진행률 (${taskDone}/${taskTotal})`} />
          </div>

          {/* Tech Stack */}
          <div className="flex flex-wrap gap-1 mt-3">
            {sprint.techStack.map((t) => <TechTag key={t} name={t} />)}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0">
          {DETAIL_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-2.5 text-xs font-medium transition-all border-b-2',
                activeTab === tab
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
            >
              {tab === '목표' && <Flag className="w-3 h-3 inline mr-1" />}
              {tab === '유저스토리' && <User className="w-3 h-3 inline mr-1" />}
              {tab === '태스크' && <CheckSquare className="w-3 h-3 inline mr-1" />}
              {tab === 'OSS 상세' && <Package className="w-3 h-3 inline mr-1" />}
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={springPresets.snappy}
            >
              {activeTab === '목표' && <GoalTab sprint={sprint} />}
              {activeTab === '유저스토리' && <UserStoryTab sprint={sprint} />}
              {activeTab === '태스크' && <TaskTab sprint={sprint} />}
              {activeTab === 'OSS 상세' && <OssTab sprint={sprint} />}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
