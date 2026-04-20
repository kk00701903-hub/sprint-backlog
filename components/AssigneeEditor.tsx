'use client'

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Check, X, UserPlus } from 'lucide-react';
import { TEAM_MEMBERS } from '@/lib/index';
import type { Assignee } from '@/lib/index';
import { useAssigneeOverride } from '@/hooks/useSprintFilter';
import { cn } from '@/lib/utils';

interface AssigneeEditorProps {
  sprintId: string;
  currentAssignees: Assignee[];
}

const ROLE_STYLE: Record<string, string> = {
  'TFT팀장': 'bg-primary/10 text-primary border-primary/20',
  'PL':     'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'PE':     'bg-muted text-muted-foreground border-border',
};

function roleStyle(role: string) {
  return ROLE_STYLE[role] ?? 'bg-muted text-muted-foreground border-border';
}

export function AssigneeEditor({ sprintId, currentAssignees }: AssigneeEditorProps) {
  const [open, setOpen] = useState(false);
  const { getAssignees, setAssignees } = useAssigneeOverride();
  const effectiveAssignees = getAssignees(sprintId, currentAssignees);
  const popoverRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const toggleMember = (member: Assignee) => {
    const already = effectiveAssignees.some((a) => a.name === member.name);
    const next = already
      ? effectiveAssignees.filter((a) => a.name !== member.name)
      : [...effectiveAssignees, member];
    setAssignees(sprintId, next);
  };

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* 담당자 뱃지 + 편집 버튼 */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <Users className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        {effectiveAssignees.length === 0 && (
          <span className="text-[11px] text-muted-foreground italic">미배정</span>
        )}
        {effectiveAssignees.map((a) => (
          <span
            key={a.name}
            className={cn(
              'text-[11px] px-2 py-0.5 rounded-md font-medium border',
              roleStyle(a.role)
            )}
          >
            {a.name}
            <span className="opacity-60 ml-0.5 text-[10px]"> {a.role}</span>
          </span>
        ))}
        <button
          onClick={() => setOpen((v) => !v)}
          className={cn(
            'flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded-md border transition-all',
            open
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-muted text-muted-foreground border-border hover:bg-secondary hover:text-foreground'
          )}
          title="담당자 변경"
        >
          <UserPlus className="w-3 h-3" />
          편집
        </button>
      </div>

      {/* 팝오버 */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full mt-1.5 z-50 w-56 bg-popover border border-border rounded-xl shadow-xl overflow-hidden"
          >
            {/* 헤더 */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/50">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> 담당자 선택
              </span>
              <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 팀원 목록 */}
            <div className="py-1 max-h-64 overflow-y-auto">
              {TEAM_MEMBERS.map((member) => {
                const selected = effectiveAssignees.some((a) => a.name === member.name);
                return (
                  <button
                    key={member.name}
                    onClick={() => toggleMember(member)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors',
                      selected
                        ? 'bg-primary/8 text-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    {/* 체크 아이콘 */}
                    <span className={cn(
                      'w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all',
                      selected
                        ? 'bg-primary border-primary text-primary-foreground'
                        : 'border-border bg-background'
                    )}>
                      {selected && <Check className="w-2.5 h-2.5" />}
                    </span>
                    {/* 이름 + 역할 + 영역 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-foreground">{member.name}</span>
                        <span className={cn(
                          'text-[10px] px-1.5 py-0 rounded border font-medium',
                          roleStyle(member.role)
                        )}>
                          {member.role}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate block">{member.area}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 푸터 — 전체 해제 */}
            <div className="border-t border-border px-3 py-2">
              <button
                onClick={() => setAssignees(sprintId, [])}
                className="text-[11px] text-muted-foreground hover:text-destructive transition-colors"
              >
                전체 해제
              </button>
              <span className="text-[11px] text-muted-foreground ml-2">
                {effectiveAssignees.length}명 선택됨
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
