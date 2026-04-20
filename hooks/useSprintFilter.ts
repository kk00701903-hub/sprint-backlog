import { useState, useMemo, useEffect, useCallback } from 'react';
import { SPRINTS } from '@/data/index';
import type { SprintFilter, SprintStatus, Priority, TaskStatus, StoryStatus, ApprovalStatus, Assignee } from '@/lib/index';

// ── localStorage 키 ────────────────────────────────────────────
const LS_KEY = 'fass_status_override_v1';
const LS_APPROVAL_KEY = 'fass_approval_override_v1';
const LS_ASSIGNEE_KEY = 'fass_assignee_override_v1';

interface StatusOverride {
  sprints: Record<string, SprintStatus>;
  stories: Record<string, StoryStatus>;
  tasks: Record<string, TaskStatus>;
  subTasks: Record<string, TaskStatus>;
}

// ── 전역 인메모리 상태 (모든 컴포넌트 공유) ───────────────────
function loadFromStorage(): StatusOverride {
  if (typeof window === 'undefined') return { sprints: {}, stories: {}, tasks: {}, subTasks: {} };
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { sprints: {}, stories: {}, tasks: {}, subTasks: {} };
}

let _override: StatusOverride = loadFromStorage();
let _pendingChanges: StatusOverride = { sprints: {}, stories: {}, tasks: {}, subTasks: {} };
const _listeners: Set<() => void> = new Set();

function notify() { _listeners.forEach((fn) => fn()); }

function hasPendingChanges(): boolean {
  return (
    Object.keys(_pendingChanges.sprints).length > 0 ||
    Object.keys(_pendingChanges.stories).length > 0 ||
    Object.keys(_pendingChanges.tasks).length > 0 ||
    Object.keys(_pendingChanges.subTasks).length > 0
  );
}

// ── 태스크 → 스토리 → 스프린트 자동 연동 ─────────────────────
function getEffTaskStatus(taskId: string, def: TaskStatus): TaskStatus {
  return (_override.tasks[taskId] as TaskStatus) ?? def;
}
function getEffSubStatus(subId: string, def: TaskStatus): TaskStatus {
  return (_override.subTasks[subId] as TaskStatus) ?? def;
}

/** 태스크 상태 변경 후 스토리·스프린트 상태를 자동 재계산 */
function autoSyncUp(changedTaskId?: string, changedSubTaskId?: string) {
  for (const sprint of SPRINTS) {
    let sprintHasChange = false;
    const storyStatuses: StoryStatus[] = [];

    for (const story of sprint.userStories) {
      const taskStatuses = story.tasks.map((t) => {
        // 서브태스크 변경 시 → 서브태스크 기반으로 태스크 상태 재계산
        if (changedSubTaskId && t.subTasks?.some((st) => st.id === changedSubTaskId)) {
          const subs = t.subTasks!;
          const subStats = subs.map((st) => getEffSubStatus(st.id, st.status));
          let derived: TaskStatus;
          if (subStats.every((s) => s === 'done')) derived = 'done';
          else if (subStats.some((s) => s === 'in-progress' || s === 'done')) derived = 'in-progress';
          else derived = 'todo';
          _override.tasks[t.id] = derived;
          _pendingChanges.tasks[t.id] = derived;
          return derived;
        }
        return getEffTaskStatus(t.id, t.status);
      });

      // 스토리 상태 재계산
      let newStoryStatus: StoryStatus;
      if (taskStatuses.every((s) => s === 'done')) newStoryStatus = 'done';
      else if (taskStatuses.some((s) => s === 'in-progress' || s === 'done')) newStoryStatus = 'in-progress';
      else newStoryStatus = 'todo';

      const prevStory = (_override.stories[story.id] as StoryStatus) ?? story.status;
      if (
        story.tasks.some((t) => t.id === changedTaskId) ||
        story.tasks.some((t) => t.subTasks?.some((st) => st.id === changedSubTaskId))
      ) {
        if (prevStory !== newStoryStatus) {
          _override.stories[story.id] = newStoryStatus;
          _pendingChanges.stories[story.id] = newStoryStatus;
          sprintHasChange = true;
        }
      }
      storyStatuses.push((_override.stories[story.id] as StoryStatus) ?? story.status);
    }

    // 스프린트 상태 재계산
    if (sprintHasChange || sprint.userStories.some((us) =>
      us.tasks.some((t) => t.id === changedTaskId) ||
      us.tasks.some((t) => t.subTasks?.some((st) => st.id === changedSubTaskId))
    )) {
      let newSprintStatus: SprintStatus;
      if (storyStatuses.every((s) => s === 'done')) newSprintStatus = 'done';
      else if (storyStatuses.some((s) => s === 'in-progress')) newSprintStatus = 'in-progress';
      else newSprintStatus = 'todo';

      const prevSprint = (_override.sprints[sprint.id] as SprintStatus) ?? sprint.status;
      if (prevSprint !== newSprintStatus) {
        _override.sprints[sprint.id] = newSprintStatus;
        _pendingChanges.sprints[sprint.id] = newSprintStatus;
      }
      break; // 해당 스프린트 찾아 처리 완료
    }
  }
}

// ── 상태 전환 훅 ─────────────────────────────────────────────
export function useStatusOverride() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const rerender = () => setTick((t) => t + 1);
    _listeners.add(rerender);
    return () => { _listeners.delete(rerender); };
  }, []);

  const getSprintStatus = useCallback((id: string, defaultVal: SprintStatus): SprintStatus =>
    (_override.sprints[id] as SprintStatus) ?? defaultVal, []);
  const getStoryStatus = useCallback((id: string, defaultVal: StoryStatus): StoryStatus =>
    (_override.stories[id] as StoryStatus) ?? defaultVal, []);
  const getTaskStatus = useCallback((id: string, defaultVal: TaskStatus): TaskStatus =>
    (_override.tasks[id] as TaskStatus) ?? defaultVal, []);
  const getSubTaskStatus = useCallback((id: string, defaultVal: TaskStatus): TaskStatus =>
    (_override.subTasks[id] as TaskStatus) ?? defaultVal, []);

  const cycleSprintStatus = useCallback((id: string, current: SprintStatus) => {
    const next: Record<SprintStatus, SprintStatus> = { 'todo': 'in-progress', 'in-progress': 'done', 'done': 'todo' };
    _override.sprints[id] = next[current];
    _pendingChanges.sprints[id] = next[current];
    notify();
  }, []);
  const cycleStoryStatus = useCallback((id: string, current: StoryStatus) => {
    const next: Record<StoryStatus, StoryStatus> = { 'todo': 'in-progress', 'in-progress': 'done', 'done': 'todo' };
    _override.stories[id] = next[current];
    _pendingChanges.stories[id] = next[current];
    notify();
  }, []);
  const cycleTaskStatus = useCallback((id: string, current: TaskStatus) => {
    const next: Record<TaskStatus, TaskStatus> = { 'todo': 'in-progress', 'in-progress': 'done', 'done': 'todo' };
    _override.tasks[id] = next[current];
    _pendingChanges.tasks[id] = next[current];
    autoSyncUp(id, undefined); // 태스크 변경 → 스토리·스프린트 자동 연동
    notify();
  }, []);
  const cycleSubTaskStatus = useCallback((id: string, current: TaskStatus) => {
    const next: Record<TaskStatus, TaskStatus> = { 'todo': 'in-progress', 'in-progress': 'done', 'done': 'todo' };
    _override.subTasks[id] = next[current];
    _pendingChanges.subTasks[id] = next[current];
    autoSyncUp(undefined, id); // 서브태스크 변경 → 태스크·스토리·스프린트 자동 연동
    notify();
  }, []);

  return {
    getSprintStatus, getStoryStatus, getTaskStatus, getSubTaskStatus,
    cycleSprintStatus, cycleStoryStatus, cycleTaskStatus, cycleSubTaskStatus,
  };
}

// ── 저장/리셋 훅 ─────────────────────────────────────────────
// ── 오버라이드 반영 진행률 훅 ───────────────────────────────
export function useSprintProgress(sprint: { id: string; userStories: { id: string; status: string; tasks: { id: string; status: string; subTasks?: { id: string; status: string }[] }[] }[] }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const rerender = () => setTick((t) => t + 1);
    _listeners.add(rerender);
    return () => { _listeners.delete(rerender); };
  }, []);

  // 태스크 전체 수 + done 수 (오버라이드 반영)
  const allTasks = sprint.userStories.flatMap((us) => us.tasks);
  const total = allTasks.length;
  const done = allTasks.filter((t) => {
    const overridden = (_override.tasks[t.id] as string | undefined);
    return (overridden ?? t.status) === 'done';
  }).length;
  const taskProgress = total > 0 ? Math.round((done / total) * 100) : 0;

  // 서브태스크 전체 수 + done 수 (오버라이드 반영)
  const allSubTasks = allTasks.flatMap((t) => t.subTasks ?? []);
  const subTotal = allSubTasks.length;
  const subDone = allSubTasks.filter((st) => {
    const overridden = (_override.subTasks[st.id] as string | undefined);
    return (overridden ?? st.status) === 'done';
  }).length;

  // 유저스토리 진행률 (오버라이드 반영)
  const storyTotal = sprint.userStories.length;
  const storyDone = sprint.userStories.filter((us) => {
    const overridden = (_override.stories[us.id] as string | undefined);
    return (overridden ?? us.status) === 'done';
  }).length;

  return { taskProgress, taskDone: done, taskTotal: total, subDone, subTotal, storyDone, storyTotal };
}

export function useStatusSave() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const rerender = () => setTick((t) => t + 1);
    _listeners.add(rerender);
    return () => { _listeners.delete(rerender); };
  }, []);

  const isDirty = hasPendingChanges();

  const saveAll = useCallback(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(_override));
      _pendingChanges = { sprints: {}, stories: {}, tasks: {}, subTasks: {} };
      notify();
    } catch (e) {
      console.error('저장 실패:', e);
    }
  }, []);

  const discardAll = useCallback(() => {
    _override = loadFromStorage();
    _pendingChanges = { sprints: {}, stories: {}, tasks: {}, subTasks: {} };
    notify();
  }, []);

  const resetAll = useCallback(() => {
    localStorage.removeItem(LS_KEY);
    _override = { sprints: {}, stories: {}, tasks: {}, subTasks: {} };
    _pendingChanges = { sprints: {}, stories: {}, tasks: {}, subTasks: {} };
    notify();
  }, []);

  const changedCount =
    Object.keys(_pendingChanges.sprints).length +
    Object.keys(_pendingChanges.stories).length +
    Object.keys(_pendingChanges.tasks).length +
    Object.keys(_pendingChanges.subTasks).length;

  return { isDirty, changedCount, saveAll, discardAll, resetAll };
}

// ── Approval 전역 상태 ────────────────────────────────────────
type ApprovalTarget = 'sprint' | 'story' | 'task' | 'subtask';
type ApprovalOverride = Record<string, ApprovalStatus>;
interface ApprovalStore { sprint: ApprovalOverride; story: ApprovalOverride; task: ApprovalOverride; subtask: ApprovalOverride; }

function loadApprovals(): ApprovalStore {
  if (typeof window === 'undefined') return { sprint: {}, story: {}, task: {}, subtask: {} };
  try { const raw = localStorage.getItem(LS_APPROVAL_KEY); if (raw) return JSON.parse(raw); } catch {}
  return { sprint: {}, story: {}, task: {}, subtask: {} };
}

let _approvals: ApprovalStore = loadApprovals();
let _pendingApprovals: ApprovalStore = { sprint: {}, story: {}, task: {}, subtask: {} };
const _approvalListeners: Set<() => void> = new Set();
function notifyApproval() { _approvalListeners.forEach((fn) => fn()); }

const APPROVAL_CYCLE: Record<ApprovalStatus, ApprovalStatus> = {
  approved: 'pending', pending: 'rejected', rejected: 'approved',
};

export function useApprovalOverride() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const r = () => setTick((t) => t + 1);
    _approvalListeners.add(r);
    return () => { _approvalListeners.delete(r); };
  }, []);

  const getApproval = useCallback((target: ApprovalTarget, id: string): ApprovalStatus =>
    (_approvals[target][id] as ApprovalStatus) ?? 'approved', []);

  const cycleApproval = useCallback((target: ApprovalTarget, id: string, current: ApprovalStatus) => {
    const next = APPROVAL_CYCLE[current];
    _approvals[target][id] = next;
    _pendingApprovals[target][id] = next;
    notifyApproval();
  }, []);

  return { getApproval, cycleApproval };
}

export function useApprovalSave() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const r = () => setTick((t) => t + 1);
    _approvalListeners.add(r);
    return () => { _approvalListeners.delete(r); };
  }, []);

  const hasPending = Object.values(_pendingApprovals).some((m) => Object.keys(m).length > 0);
  const pendingCount = Object.values(_pendingApprovals).reduce((s, m) => s + Object.keys(m).length, 0);

  const saveApprovals = useCallback(() => {
    try { localStorage.setItem(LS_APPROVAL_KEY, JSON.stringify(_approvals)); _pendingApprovals = { sprint: {}, story: {}, task: {}, subtask: {} }; notifyApproval(); } catch {}
  }, []);
  const discardApprovals = useCallback(() => {
    _approvals = loadApprovals(); _pendingApprovals = { sprint: {}, story: {}, task: {}, subtask: {} }; notifyApproval();
  }, []);
  const resetApprovals = useCallback(() => {
    localStorage.removeItem(LS_APPROVAL_KEY); _approvals = { sprint: {}, story: {}, task: {}, subtask: {} }; _pendingApprovals = { sprint: {}, story: {}, task: {}, subtask: {} }; notifyApproval();
  }, []);

  return { hasPending, pendingCount, saveApprovals, discardApprovals, resetApprovals };
}

// ══════════════════════════════════════════════════════════════
// 담당자(Assignee) Override
// ══════════════════════════════════════════════════════════════
type AssigneeOverride = Record<string, Assignee[]>; // sprintId → Assignee[]

function loadAssignees(): AssigneeOverride {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(LS_ASSIGNEE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

let _assignees: AssigneeOverride = loadAssignees();
let _pendingAssignees: AssigneeOverride = {};
const _assigneeListeners: Set<() => void> = new Set();

function notifyAssignee() { _assigneeListeners.forEach((fn) => fn()); }

function hasPendingAssignees(): boolean {
  return Object.keys(_pendingAssignees).length > 0;
}

/** 해당 스프린트의 실제 담당자 목록 반환 (override 우선) */
export function getEffAssignees(sprintId: string, defaultAssignees: Assignee[]): Assignee[] {
  return _assignees[sprintId] ?? defaultAssignees;
}

export function useAssigneeOverride() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const fn = () => forceUpdate((n) => n + 1);
    _assigneeListeners.add(fn);
    return () => { _assigneeListeners.delete(fn); };
  }, []);

  const getAssignees = useCallback((sprintId: string, defaults: Assignee[]): Assignee[] => {
    return _assignees[sprintId] ?? defaults;
  }, []);

  const setAssignees = useCallback((sprintId: string, assignees: Assignee[]) => {
    _assignees[sprintId] = assignees;
    _pendingAssignees[sprintId] = assignees;
    notifyAssignee();
  }, []);

  return { getAssignees, setAssignees };
}

export function useAssigneeSave() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const fn = () => forceUpdate((n) => n + 1);
    _assigneeListeners.add(fn);
    return () => { _assigneeListeners.delete(fn); };
  }, []);

  const hasPending = hasPendingAssignees();
  const pendingCount = Object.keys(_pendingAssignees).length;

  const saveAssignees = useCallback(() => {
    try {
      localStorage.setItem(LS_ASSIGNEE_KEY, JSON.stringify(_assignees));
      _pendingAssignees = {};
      notifyAssignee();
    } catch {}
  }, []);

  const discardAssignees = useCallback(() => {
    for (const id of Object.keys(_pendingAssignees)) {
      delete _assignees[id];
    }
    _pendingAssignees = {};
    notifyAssignee();
  }, []);

  const resetAssignees = useCallback(() => {
    localStorage.removeItem(LS_ASSIGNEE_KEY);
    _assignees = {};
    _pendingAssignees = {};
    notifyAssignee();
  }, []);

  return { hasPending, pendingCount, saveAssignees, discardAssignees, resetAssignees };
}

// ── 스프린트 필터 훅 ──────────────────────────────────────────
export function useSprintFilter() {
  const [filter, setFilter] = useState<SprintFilter>({
    status: 'all', priority: 'all', phase: 'all', search: '', assignee: 'all',
  });
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [sidebarSprintId, setSidebarSprintId] = useState<string | null>(null);

  const filteredSprints = useMemo(() => {
    if (sidebarSprintId) {
      return SPRINTS.filter((s) => s.id === sidebarSprintId);
    }
    return SPRINTS.filter((sprint) => {
      if (filter.status !== 'all' && sprint.status !== filter.status) return false;
      if (filter.priority !== 'all' && sprint.priority !== filter.priority) return false;
      if (filter.phase !== 'all' && sprint.phase !== filter.phase) return false;
      if (filter.assignee !== 'all') {
        const effAssignees = getEffAssignees(sprint.id, sprint.assignees ?? []);
        if (!effAssignees.some((a) => a.name === filter.assignee)) return false;
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        return (
          sprint.title.toLowerCase().includes(q) ||
          sprint.subtitle.toLowerCase().includes(q) ||
          sprint.description.toLowerCase().includes(q) ||
          sprint.goal.summary.toLowerCase().includes(q) ||
          sprint.techStack.some((t) => t.toLowerCase().includes(q)) ||
          sprint.userStories.some((us) =>
            us.iWantTo.toLowerCase().includes(q) ||
            us.tasks.some((t) => t.title.toLowerCase().includes(q))
          )
        );
      }
      return true;
    });
  }, [filter, sidebarSprintId]);

  const selectedSprint = useMemo(
    () => SPRINTS.find((s) => s.id === selectedSprintId) ?? null,
    [selectedSprintId]
  );

  const handleSidebarSelect = (id: string | null) => {
    setSidebarSprintId(id);
    setSelectedSprintId(id ?? null);
  };

  const setStatus = (status: SprintStatus | 'all') => { setSidebarSprintId(null); setFilter((f) => ({ ...f, status })); };
  const setPriority = (priority: Priority | 'all') => { setSidebarSprintId(null); setFilter((f) => ({ ...f, priority })); };
  const setPhase = (phase: string) => { setSidebarSprintId(null); setFilter((f) => ({ ...f, phase })); };
  const setSearch = (search: string) => { setSidebarSprintId(null); setFilter((f) => ({ ...f, search })); };
  const setAssigneeFilter = (assignee: string) => { setSidebarSprintId(null); setFilter((f) => ({ ...f, assignee })); };

  return {
    filter, filteredSprints, selectedSprint, selectedSprintId, setSelectedSprintId,
    sidebarSprintId, handleSidebarSelect, setStatus, setPriority, setPhase, setSearch, setAssigneeFilter,
  };
}
