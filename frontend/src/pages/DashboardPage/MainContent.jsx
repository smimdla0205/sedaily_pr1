/**
 * MainContent 컴포넌트 (리팩토링 버전)
 *
 * 책임:
 * - 메인 페이지 레이아웃 구성
 * - 사용자 역할에 따른 UI 표시
 * - 프롬프트 관리 (관리자)
 * - 채팅 입력 (모든 사용자)
 */

import React, { useState, useRef, useEffect } from "react";
import clsx from "clsx";

// Hooks
import { usePromptManagement } from "../../hooks/usePromptManagement";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";

// Components
import Header from "../../layouts/Header";
import ChatInput from "../ChatPage/ChatInput";
import PromptManagePanel from "./PromptManagePanel";
import FileDropOverlay from "../../components/FileDropOverlay";
import ProjectHeader from "../../components/ProjectHeader";
import EditDescriptionModal from "../../components/EditDescriptionModal";

// Services
import usageService from "../../features/chat/services/usageService";

const MainContent = ({
  project,
  userRole,
  selectedEngine = "11",
  onToggleStar,
  onStartChat,
  onLogout,
  onBackToLanding,
  onToggleSidebar,
  isSidebarOpen = false,
  onDashboard,
}) => {
  // 프롬프트 관리 훅
  const {
    prompt,
    loading: promptLoading,
    saving: promptSaving,
    updatePrompt,
    loadPrompt,
  } = usePromptManagement(selectedEngine);

  // 로컬 상태
  const [showDropdown, setShowDropdown] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [usagePercentage, setUsagePercentage] = useState(() => {
    const cachedValue = localStorage.getItem(`usage_percentage_${selectedEngine}`);
    return cachedValue ? parseInt(cachedValue) : 0;
  });

  // Refs
  const dropdownRef = useRef(null);
  const chatInputRef = useRef(null);

  // 관리자 권한 확인
  const storedUserRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin' || storedUserRole === 'admin';

  // 드래그 앤 드롭
  const handleFilesDropped = async (files) => {
    if (chatInputRef.current?.handleDroppedFiles) {
      await chatInputRef.current.handleDroppedFiles(files);
    }
  };

  const { isDragging, dragHandlers } = useDragAndDrop(handleFilesDropped, {
    acceptedFileTypes: ['.txt', '.pdf'],
    maxFileSize: 500 * 1024 * 1024,
    multiple: true,
  });

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 프롬프트 로드
        await loadPrompt();

        // 사용량 로드
        localStorage.removeItem(`usage_percentage_${selectedEngine}`);
        localStorage.removeItem(`usage_percentage_time_${selectedEngine}`);

        const percentage = await usageService.getUsagePercentage(selectedEngine, true);
        setUsagePercentage(percentage);

        window.dispatchEvent(new CustomEvent("usageUpdated"));
      } catch (error) {
        console.error("Failed to load data:", error);
      }
    };

    loadData();
  }, [selectedEngine, loadPrompt]);

  // 프롬프트 변경 감지
  useEffect(() => {
    if (prompt?.description) {
      setEditDescription(prompt.description);
    }
  }, [prompt]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 핸들러
  const handleEditClick = () => {
    setShowEditModal(true);
  };

  const handleSaveDescription = async () => {
    const success = await updatePrompt({ description: editDescription });

    if (success) {
      setShowEditModal(false);
      // PromptManagePanel 리프레시
      window.location.reload();
    } else {
      alert("설명 저장에 실패했습니다.");
    }
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
    setEditDescription(prompt?.description || "");
  };

  return (
    <div className="min-h-screen flex flex-col" {...dragHandlers}>
      {/* 파일 드롭 오버레이 */}
      <FileDropOverlay isVisible={isDragging} />

      {/* 헤더 */}
      <Header
        onLogout={onLogout}
        onHome={onBackToLanding}
        onToggleSidebar={onToggleSidebar}
        isSidebarOpen={isSidebarOpen}
        onDashboard={onDashboard}
        selectedEngine={selectedEngine}
        usagePercentage={usagePercentage}
      />

      {/* 메인 그리드 */}
      <main className="mx-auto mt-4 w-full flex-1 lg:mt-6 flex gap-6 max-w-7xl flex-col xl:flex-row px-6 lg:px-8">
        <div className="flex-1 flex flex-col gap-4">
          {/* 채팅 인터페이스 */}
          <div className="flex flex-col gap-3 max-md:pt-4 mt-4 w-full items-start max-w-none">
            {/* 프로젝트 헤더 */}
            <ProjectHeader
              title={project.title}
              isStarred={project.isStarred}
              onToggleStar={onToggleStar}
              onEdit={handleEditClick}
              showDropdown={showDropdown}
              onToggleDropdown={() => setShowDropdown(!showDropdown)}
              dropdownRef={dropdownRef}
              userRole={userRole}
            />

            {/* 채팅 입력 */}
            <div className="z-10 w-full">
              <ChatInput
                ref={chatInputRef}
                onSendMessage={() => {}}
                onStartChat={onStartChat}
                onTitlesGenerated={() => {}}
                engineType={selectedEngine}
              />
            </div>

            {/* 프롬프트 관리 패널 (모바일) - ai@sedaily.com만 표시 */}
            {isAdmin && (
              <div className="w-full xl:hidden">
                <PromptManagePanel engineType={selectedEngine} />
              </div>
            )}
          </div>
        </div>

        {/* 프롬프트 관리 패널 (데스크톱) - ai@sedaily.com만 표시 */}
        {isAdmin && (
          <div className="hidden xl:block">
            <PromptManagePanel engineType={selectedEngine} />
          </div>
        )}
      </main>

      {/* 설명 편집 모달 */}
      <EditDescriptionModal
        isOpen={showEditModal}
        description={editDescription}
        engineType={selectedEngine}
        saving={promptSaving}
        onDescriptionChange={setEditDescription}
        onSave={handleSaveDescription}
        onCancel={handleCancelEdit}
      />
    </div>
  );
};

export default MainContent;
