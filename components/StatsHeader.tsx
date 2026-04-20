'use client'

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { SPRINTS, SPRINT_STATS } from '@/data/index';
import { springPresets } from '@/lib/motion';
import { ProgressBar } from '@/components/Badges';
import {
  CheckCircle2, Clock, Circle, Layers, TrendingUp, FlaskConical,
} from 'lucide-react';

export function StatsHeader() {
  const taskStats = useMemo(() => {
    const allTasks = SPRINTS.flatMap((s) => s.userStories.flatMap((us) => us.tasks));
    return {
      total:      allTasks.length,
      done:       allTasks.filter((t) => t.status === 'done').length,
      inProgress: allTasks.filter((t) => t.status === 'in-progress').length,
      todo:       allTasks.filter((t) => t.status === 'todo').length,
    };
  }, []);

  const storyStats = useMemo(() => {
    const allStories = SPRINTS.flatMap((s) => s.userStories);
    const totalPts = allStories.reduce((sum, us) => sum + (us.storyPoints ?? 0), 0);
    return { total: allStories.length, totalPts };
  }, []);

  const overallProgress = Math.round(
    taskStats.total > 0 ? (taskStats.done / taskStats.total) * 100 : 0
  );

  const cards = [
    {
      icon: <Layers className="w-4 h-4" />,
      label: '전체 스프린트',
      value: SPRINT_STATS.total,
      sub: (
        <span className="flex items-center gap-1 flex-wrap">
          <span>주요 {SPRINT_STATS.main}개</span>
          <span className="text-muted-foreground/40">·</span>
          <span className="flex items-center gap-0.5 text-amber-500">
            <FlaskConical className="w-2.5 h-2.5" />
            추가 {SPRINT_STATS.additional}개
          </span>
        </span>
      ),
      color: 'text-primary',
      bg: 'bg-primary/10 border-primary/20',
    },
    {
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: '완료 스프린트',
      value: SPRINT_STATS.done,
      sub: <span>태스크 {taskStats.done}개 완료</span>,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: '진행 중',
      value: SPRINT_STATS.inProgress,
      sub: <span>태스크 {taskStats.inProgress}개 진행</span>,
      color: 'text-accent',
      bg: 'bg-accent/10 border-accent/20',
    },
    {
      icon: <Circle className="w-4 h-4" />,
      label: '예정',
      value: SPRINT_STATS.todo,
      sub: <span>유저스토리 {storyStats.total}개 · {storyStats.totalPts}pts</span>,
      color: 'text-muted-foreground',
      bg: 'bg-muted/50 border-border',
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: '전체 진행률',
      value: `${overallProgress}%`,
      sub: <span>태스크 {taskStats.done}/{taskStats.total}</span>,
      color: overallProgress >= 80 ? 'text-emerald-400' : overallProgress >= 40 ? 'text-accent' : 'text-primary',
      bg: 'bg-primary/5 border-primary/10',
      extra: (
        <div className="mt-2">
          <ProgressBar value={overallProgress} />
        </div>
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springPresets.gentle}
      className="w-full"
    >
      {/* 타이틀 */}
      <div className="mb-3 flex items-end justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground tracking-tight">
            FaSS Platform — 스프린트 백로그
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            (주)제때 차세대 웹프레임워크 FaSS Platform 개발 표준 가이드라인
            <span className="ml-2 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-mono">v3.0</span>
          </p>
          <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
            v1.0 &nbsp;·&nbsp; 작성일 2026-04-14 &nbsp;·&nbsp; 작성자 서선범
          </p>
        </div>
        {/* 주요/추가 구분 뱃지 */}
        <div className="flex items-center gap-1.5 text-[10px]">
          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 font-semibold">
            주요 {SPRINT_STATS.main}개
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-500/10 text-amber-500 border border-amber-500/20 font-semibold">
            <FlaskConical className="w-3 h-3" /> 추가과제 {SPRINT_STATS.additional}개
          </span>
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {cards.map((card) => (
          <motion.div
            key={card.label}
            whileHover={{ y: -1 }}
            transition={springPresets.snappy}
            className={`rounded-xl border p-3 ${card.bg}`}
          >
            <div className={`flex items-center gap-1.5 mb-1 ${card.color}`}>
              {card.icon}
              <span className="text-[11px] font-medium text-muted-foreground">{card.label}</span>
            </div>
            <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{card.sub}</div>
            {card.extra}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
