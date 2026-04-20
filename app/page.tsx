'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, ChevronLeft } from 'lucide-react'
import { SidebarNav } from '@/components/SidebarNav'
import { StatsHeader } from '@/components/StatsHeader'
import { FilterBar } from '@/components/FilterBar'
import { SprintGrid } from '@/components/SprintGrid'
import { SprintDetailPanel } from '@/components/SprintDetailPanel'
import { SaveBar } from '@/components/SaveBar'
import { useSprintFilter } from '@/hooks/useSprintFilter'
import { springPresets } from '@/lib/motion'
import { cn } from '@/lib/utils'

export default function BacklogPage() {
  const {
    filter, filteredSprints, selectedSprint, selectedSprintId, setSelectedSprintId,
    sidebarSprintId, handleSidebarSelect, setStatus, setPriority, setPhase, setSearch, setAssigneeFilter,
  } = useSprintFilter()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1280)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // 화면 크기 변경 시 사이드바 닫기
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 1280) setSidebarOpen(false) }
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* 모바일 오버레이 */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-foreground/20 backdrop-blur-sm xl:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* 사이드바 */}
      <motion.div
        className={cn('fixed xl:relative z-40 xl:z-auto h-full xl:flex xl:flex-col shrink-0')}
        initial={false}
        animate={{ x: sidebarOpen ? 0 : (isMobile ? -380 : 0) }}
        transition={springPresets.gentle}
      >
        <SidebarNav
          activeSidebarId={sidebarSprintId}
          onSidebarSelect={(id) => {
            handleSidebarSelect(id)
            setSidebarOpen(false)
          }}
        />
      </motion.div>

      {/* 메인 영역 */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* 모바일 헤더 */}
        <div className="xl:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-card shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <p className="text-sm font-bold text-foreground">FaSS Backlog</p>
            <p className="text-xs text-muted-foreground font-mono">(주)제때 FaSS Platform</p>
          </div>
        </div>

        {/* 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto">
          <div className="w-full p-3 lg:p-4 space-y-4">
            {/* 통계 헤더 */}
            <StatsHeader />

            {/* 사이드바 선택 상태 배너 */}
            {sidebarSprintId && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm text-primary"
              >
                <span className="flex-1 font-medium">사이드바에서 선택한 스프린트만 표시 중입니다</span>
                <button
                  onClick={() => handleSidebarSelect(null)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground border border-border rounded px-2 py-0.5 bg-card transition-colors"
                >
                  <ChevronLeft className="w-3 h-3" /> 전체 보기로 돌아가기
                </button>
              </motion.div>
            )}

            {/* 필터바 */}
            {!sidebarSprintId && (
              <FilterBar
                filter={filter}
                onStatusChange={setStatus}
                onPriorityChange={setPriority}
                onPhaseChange={setPhase}
                onSearchChange={setSearch}
                onAssigneeChange={setAssigneeFilter}
                resultCount={filteredSprints.length}
              />
            )}

            {/* 콘텐츠 */}
            {sidebarSprintId && selectedSprint ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                transition={springPresets.gentle}
                className="h-[calc(100vh-1rem)] overflow-hidden"
              >
                <SprintDetailPanel
                  sprint={selectedSprint}
                  onClose={() => { setSelectedSprintId(null); handleSidebarSelect(null) }}
                />
              </motion.div>
            ) : (
              <div className={selectedSprint ? 'grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_600px] gap-4 items-start' : 'block'}>
                <SprintGrid
                  sprints={filteredSprints}
                  selectedSprintId={selectedSprintId}
                  onSelectSprint={setSelectedSprintId}
                  defaultListView={!sidebarSprintId}
                />
                {selectedSprint && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                    transition={springPresets.gentle}
                    className="xl:sticky xl:top-0 xl:h-[calc(100vh-1rem)] xl:overflow-hidden"
                  >
                    <SprintDetailPanel sprint={selectedSprint} onClose={() => setSelectedSprintId(null)} />
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 저장 바 */}
      <SaveBar />
    </div>
  )
}
