/**
 * 프로젝트 헤더 컴포넌트
 *
 * 책임:
 * - 프로젝트 제목 표시
 * - 편집 버튼 표시
 * - 별표 토글 버튼 표시
 */

import React from 'react';
import { MoreHorizontal, Star, Edit3 } from 'lucide-react';
import clsx from 'clsx';

const ProjectHeader = ({
  title,
  isStarred,
  onToggleStar,
  onEdit,
  showDropdown,
  onToggleDropdown,
  dropdownRef,
}) => {
  return (
    <div className="flex items-start gap-3 w-full">
      {/* 프로젝트 제목 */}
      <h1
        className="min-w-0 gap-1.5 text-left break-words flex-1"
        style={{
          margin: "0",
          marginTop: "0.125rem",
          overflowWrap: "break-word",
          textAlign: "left",
          color: "hsl(var(--text-200))",
          fontFamily: "var(--font-ui-serif)",
          lineHeight: "1.3",
          fontSize: "1.5rem",
          fontWeight: "500",
          letterSpacing: "-0.025em",
          fontFeatureSettings: '"ss01" 0',
        }}
      >
        {title}
      </h1>

      {/* 편집 버튼들 */}
      <div className="flex items-center gap-1 ml-auto">
        {/* 더보기 버튼 */}
        <div className="relative" ref={dropdownRef}>
          <button
            className="inline-flex items-center justify-center relative shrink-0 select-none text-text-300 border-transparent transition-claude hover:bg-bg-300 hover:text-text-100 h-8 w-8 rounded-md active:scale-95 active:!scale-100 pointer-events-auto"
            type="button"
            aria-label={`More options for ${title}`}
            onClick={onToggleDropdown}
          >
            <MoreHorizontal size={20} />
          </button>

          {/* 드롭다운 메뉴 */}
          {showDropdown && (
            <div
              className="absolute right-0 top-full mt-2 z-50 min-w-[8rem] overflow-hidden p-1.5 text-text-300 rounded-xl border-0.5"
              style={{
                backgroundColor: "hsl(var(--bg-000))",
                borderColor: "hsl(var(--border-300)/0.15)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 0 0 1px hsl(var(--always-black)/4%)",
              }}
              role="menu"
            >
              <button
                onClick={() => {
                  onEdit();
                  onToggleDropdown();
                }}
                className="relative flex w-full min-w-0 select-none items-center rounded-lg border border-transparent px-3 py-2 text-xs text-text-100 transition-colors hover:border-border-100 hover:bg-bg-100 active:bg-bg-200 active:border-border-100 active:text-text-100"
              >
                <Edit3 className="mr-2 h-3.5 w-3.5" />
                <span>설명 편집</span>
              </button>
            </div>
          )}
        </div>

        {/* 별표 버튼 */}
        <button
          className={clsx(
            "inline-flex items-center justify-center relative shrink-0 select-none border-transparent transition-claude h-8 w-8 rounded-md active:scale-95 relative *:transition *:ease-in-out *:duration-300",
            isStarred
              ? "text-accent-main-000"
              : "text-text-300 hover:bg-bg-300 hover:text-text-100"
          )}
          type="button"
          onClick={onToggleStar}
          aria-pressed={isStarred}
        >
          <div className="flex items-center justify-center scale-100 opacity-100 rotate-0">
            <Star size={20} fill={isStarred ? "currentColor" : "none"} />
          </div>
        </button>
      </div>
    </div>
  );
};

export default ProjectHeader;
