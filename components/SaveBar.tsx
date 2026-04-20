'use client'

import { useStatusSave, useApprovalSave, useAssigneeSave } from '@/hooks/useSprintFilter';
import { Save, RotateCcw, X, ShieldCheck, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function SaveBar() {
  const { isDirty, changedCount, saveAll, discardAll, resetAll } = useStatusSave();
  const { hasPending: approvalDirty, pendingCount: approvalCount, saveApprovals, discardApprovals, resetApprovals } = useApprovalSave();
  const { hasPending: assigneeDirty, pendingCount: assigneeCount, saveAssignees, discardAssignees, resetAssignees } = useAssigneeSave();

  const totalCount = changedCount + approvalCount + assigneeCount;
  const anyDirty = isDirty || approvalDirty || assigneeDirty;

  const handleSave = () => { saveAll(); saveApprovals(); saveAssignees(); };
  const handleDiscard = () => { discardAll(); discardApprovals(); discardAssignees(); };
  const handleReset = () => { resetAll(); resetApprovals(); resetAssignees(); };

  return (
    <AnimatePresence>
      {anyDirty && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-foreground text-background shadow-2xl border border-border/20"
        >
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="w-5 h-5 rounded-full bg-amber-400 text-black text-[11px] font-bold flex items-center justify-center shrink-0">
              {totalCount}
            </span>
            <span className="opacity-80">개 변경됨</span>
            {approvalDirty && (
              <span className="flex items-center gap-0.5 text-[11px] opacity-60">
                <ShieldCheck className="w-3 h-3" />
                승인 {approvalCount}
              </span>
            )}
            {assigneeDirty && (
              <span className="flex items-center gap-0.5 text-[11px] opacity-60">
                <Users className="w-3 h-3" />
                담당자 {assigneeCount}
              </span>
            )}
          </div>
          <div className="w-px h-5 bg-background/20" />
          <button
            onClick={handleDiscard}
            className="flex items-center gap-1.5 text-sm opacity-60 hover:opacity-100 transition-opacity"
            title="변경 취소"
          >
            <X className="w-3.5 h-3.5" />
            취소
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 text-sm font-semibold bg-primary text-primary-foreground px-4 py-1.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            <Save className="w-3.5 h-3.5" />
            저장
          </button>
          <button
            onClick={handleReset}
            title="전체 초기화"
            className="opacity-40 hover:opacity-80 transition-opacity"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
