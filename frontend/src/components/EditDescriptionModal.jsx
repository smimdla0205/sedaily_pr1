/**
 * 설명 편집 모달 컴포넌트
 *
 * 책임:
 * - 프로젝트 설명 편집 UI 제공
 */

import React from 'react';

const EditDescriptionModal = ({
  isOpen,
  description,
  engineType,
  saving,
  onDescriptionChange,
  onSave,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className="bg-bg-100 rounded-2xl shadow-2xl border border-bg-300 w-full max-w-2xl max-h-[85vh] overflow-hidden animate-[zoom_250ms_ease-in_forwards]"
        style={{
          backgroundColor: "hsl(var(--bg-100))",
          borderColor: "hsl(var(--border-300)/0.15)",
        }}
      >
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-bg-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-text-100">
                프로젝트 설명 편집
              </h2>
              <p className="mt-1 text-sm text-text-300">
                {engineType} 엔진의 프로젝트 설명을 수정합니다
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-2 text-text-400 hover:text-text-100 hover:bg-bg-200 rounded-lg transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M15.1465 4.14642C15.3418 3.95121 15.6583 3.95118 15.8536 4.14642C16.0487 4.34168 16.0488 4.65822 15.8536 4.85346L10.7071 9.99997L15.8536 15.1465C16.0487 15.3417 16.0488 15.6583 15.8536 15.8535C15.6828 16.0244 15.4187 16.0461 15.2247 15.918L15.1465 15.8535L10 10.707L4.85352 15.8535C4.65827 16.0486 4.34168 16.0486 4.14648 15.8535C3.95129 15.6583 3.95142 15.3418 4.14648 15.1465L9.293 9.99997L4.14648 4.85346C3.95142 4.65818 3.95129 4.34162 4.14648 4.14642C4.34168 3.95128 4.65825 3.95138 4.85352 4.14642L10 9.29294L15.1465 4.14642Z"></path>
              </svg>
            </button>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="px-6 py-6 overflow-y-auto max-h-[calc(85vh-180px)]">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-text-200 mb-3">
                프로젝트 설명
              </label>
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => onDescriptionChange(e.target.value)}
                  rows={8}
                  placeholder="프로젝트 설명을 입력하세요..."
                  className="w-full px-4 py-3 border border-bg-300 rounded-lg bg-bg-000 text-text-100 placeholder-text-400 resize-none focus:outline-none focus:border-accent-main-100 focus:ring-2 focus:ring-accent-main-100/20 transition-all"
                  style={{
                    minHeight: "200px",
                    maxHeight: "400px",
                  }}
                />
                <div className="absolute bottom-3 right-3 text-xs text-text-400">
                  {description.length} 글자
                </div>
              </div>
              <p className="mt-2 text-xs text-text-400">
                이 설명은 프로젝트 개요를 이해하는 데 도움이 됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* 푸터 */}
        <div className="px-6 py-4 border-t border-bg-300 bg-bg-50">
          <div className="flex items-center justify-between">
            <p className="text-xs text-text-400">
              마지막 수정: {new Date().toLocaleString("ko-KR")}
            </p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="px-5 py-2.5 text-text-200 font-medium rounded-lg hover:bg-bg-200 hover:text-text-100 transition-all"
              >
                취소
              </button>
              <button
                onClick={onSave}
                className="px-5 py-2.5 bg-accent-main-100 text-white font-medium rounded-lg hover:bg-accent-main-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={saving || !description.trim()}
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    저장 중...
                  </>
                ) : (
                  "저장"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDescriptionModal;
