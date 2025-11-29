/**
 * 파일 드롭 오버레이 컴포넌트
 *
 * 책임:
 * - 드래그 앤 드롭 시각적 피드백 표시
 */

import React from 'react';

const FileDropOverlay = ({ isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
      <div className="relative">
        <div
          className="w-96 h-48 border-2 border-dashed border-blue-400 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 flex flex-col items-center justify-center gap-4 transition-all duration-200 animate-pulse"
          style={{
            background:
              "linear-gradient(135deg, hsl(var(--accent-main-100))/10%, hsl(var(--accent-main-200))/5%)",
            borderColor: "hsl(var(--accent-main-100))",
          }}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center animate-bounce">
              <svg
                className="w-8 h-8 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-300 mb-1">
                파일을 여기에 놓으세요
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                지원 형식: TXT, PDF (최대 500MB)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDropOverlay;
