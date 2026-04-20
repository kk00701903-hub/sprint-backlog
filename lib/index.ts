// ============================================================
// Types
// ============================================================

export type SprintStatus = 'todo' | 'in-progress' | 'done';
/** 승인 상태: approved(승인) → pending(보류) → rejected(반려) */
export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

/** 담당자 */
export interface Assignee {
  name: string;
  role: 'TFT팀장' | 'PL' | 'PE' | '인프라' | 'DBA' | 'AI Agent개발자';
  area: string; // 예: "아키텍처 총괄", "백엔드·인프라"
}
export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in-progress' | 'done';
export type StoryStatus = 'todo' | 'in-progress' | 'done';

/** 서브 태스크 */
export interface SubTask {
  id: string;
  title: string;
  status: TaskStatus;
  approval?: ApprovalStatus; // 기본값: 'approved'
}

/** 태스크 */
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TaskStatus;
  assigneeRole?: string;   // 예: "백엔드 개발자", "프론트엔드 개발자"
  techStack?: string[];
  guideRef?: string;
  estimatedDays?: number;
  subTasks?: SubTask[];
  approval?: ApprovalStatus; // 기본값: 'approved'
}

/** 유저 스토리 */
export interface UserStory {
  id: string;
  /** As a [role] */
  asA: string;
  /** I want to [action] */
  iWantTo: string;
  /** So that [benefit] */
  soThat: string;
  /** TO-BE: 현재 문제 → 목표 상태 설명 */
  asBefore: string;   // AS-IS (문제/Pain point)
  toBe: string;       // TO-BE (기대 상태)
  priority: Priority;
  status: StoryStatus;
  storyPoints?: number;
  acceptanceCriteria: string[];
  tasks: Task[];
  approval?: ApprovalStatus; // 기본값: 'approved'
}

/** 오픈소스 진행 방향 세부 */
export interface OssDetail {
  name: string;           // 오픈소스 명칭
  version?: string;       // 적용 버전
  role: string;           // 역할 요약
  why: string;            // 선택 이유 (AS-IS 문제 해결)
  setupSteps: string[];   // 설정/설치 단계
  keyConfig?: string;     // 핵심 설정값 또는 코드 스니펫 (한 줄)
  pitfalls?: string[];    // 주의사항 / 흔한 실수
  references?: string[];  // 공식 문서 또는 가이드 섹션
}

/** 스프린트 목표 */
export interface SprintGoal {
  summary: string;           // 한 줄 목표 요약
  problem: string;           // 해결할 문제 (AS-IS)
  objective: string;         // 달성할 목표 (TO-BE)
  deliverables: string[];    // 주요 산출물
  dependencies?: string[];   // 선행 의존성
}

export interface Sprint {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  status: SprintStatus;
  priority: Priority;
  duration: string;
  phase: string;
  category?: 'additional';   // 추가과제 스프린트 구분자
  guideSection: string;
  icon: string;
  techStack: string[];
  goal: SprintGoal;
  userStories: UserStory[];
  ossDetails?: OssDetail[];  // 오픈소스 세부 진행방향
  assignees?: Assignee[];
  approval?: ApprovalStatus; // 기본값: 'approved'
}

export interface SprintFilter {
  status: SprintStatus | 'all';
  priority: Priority | 'all';
  phase: string;
  search: string;
  assignee: string; // 담당자 이름, 'all'이면 전체
}

// ============================================================
// Routes
// ============================================================

export const ROUTE_PATHS = {
  HOME: '/',
} as const;

// ============================================================
// Constants
// ============================================================

export const STATUS_LABELS: Record<SprintStatus | TaskStatus, string> = {
  'todo': 'TODO',
  'in-progress': '진행 중',
  'done': '완료',
};

export const APPROVAL_LABELS: Record<ApprovalStatus, string> = {
  'approved': '승인',
  'pending': '보류',
  'rejected': '반려',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: '높음',
  medium: '중간',
  low: '낮음',
};

/** 전체 팀원 목록 (담당자 필터·선택에 사용) */
export const TEAM_MEMBERS: Assignee[] = [
  { name: '서선범', role: 'TFT팀장', area: '아키텍처 총괄·승인' },
  { name: '기충영', role: 'PL',     area: '기술 리드·MR 승인' },
  { name: '심지훈', role: 'PE',     area: '백엔드·인프라' },
  { name: '김희찬', role: 'PE',     area: '백엔드·API' },
  { name: '송민준', role: 'PE',     area: '프론트엔드' },
  { name: '이지상', role: 'PE',     area: '프론트엔드·UI' },
  { name: '오준열', role: 'PE',     area: '풀스택' },
];

export const PHASE_OPTIONS = [
  { value: 'all',     label: '전체' },
  { value: 'Phase 0', label: 'Phase 0' },
  { value: 'Phase 1', label: 'Phase 1' },
  { value: 'Phase 2', label: 'Phase 2' },
  { value: 'Phase 3', label: 'Phase 3' },
  { value: 'Phase 4', label: 'Phase 4' },
  { value: '추가과제', label: '추가과제' },
];

export const DETAIL_TABS = ['목표', '유저스토리', '태스크', 'OSS 상세'] as const;
export type DetailTab = typeof DETAIL_TABS[number];
