/**
 * 드래그 앤 드롭 훅
 *
 * 책임:
 * - 파일 드래그 앤 드롭 상태 관리
 * - 드래그 이벤트 핸들링
 * - 파일 유효성 검사
 */

import { useState, useRef, useCallback } from 'react';

export const useDragAndDrop = (onFilesDropped, options = {}) => {
  const {
    acceptedFileTypes = ['.txt', '.pdf'],
    maxFileSize = 500 * 1024 * 1024, // 500MB
    multiple = true,
  } = options;

  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  /**
   * 파일 유효성 검사
   */
  const validateFile = useCallback((file) => {
    // 파일 타입 검사
    const extension = '.' + file.name.split('.').pop().toLowerCase();
    if (!acceptedFileTypes.includes(extension)) {
      return {
        valid: false,
        error: `지원하지 않는 파일 형식입니다. ${acceptedFileTypes.join(', ')} 파일만 허용됩니다.`,
      };
    }

    // 파일 크기 검사
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / 1024 / 1024);
      return {
        valid: false,
        error: `파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`,
      };
    }

    return { valid: true };
  }, [acceptedFileTypes, maxFileSize]);

  /**
   * 드래그 진입
   */
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current += 1;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  }, []);

  /**
   * 드래그 이탈
   */
  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    dragCounterRef.current -= 1;

    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  /**
   * 드래그 오버
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  /**
   * 드롭
   */
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
    dragCounterRef.current = 0;

    const files = Array.from(e.dataTransfer.files);

    if (files.length === 0) return;

    // 다중 파일 허용 여부 체크
    if (!multiple && files.length > 1) {
      alert('한 번에 하나의 파일만 업로드할 수 있습니다.');
      return;
    }

    // 파일 유효성 검사
    const validatedFiles = files.map((file) => ({
      file,
      validation: validateFile(file),
    }));

    // 유효하지 않은 파일 체크
    const invalidFiles = validatedFiles.filter((f) => !f.validation.valid);

    if (invalidFiles.length > 0) {
      alert(invalidFiles[0].validation.error);
      return;
    }

    // 콜백 호출
    const validFiles = validatedFiles.map((f) => f.file);
    onFilesDropped(validFiles);
  }, [multiple, validateFile, onFilesDropped]);

  /**
   * 드래그 상태 초기화
   */
  const resetDragState = useCallback(() => {
    setIsDragging(false);
    dragCounterRef.current = 0;
  }, []);

  return {
    isDragging,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
    },
    resetDragState,
  };
};

export default useDragAndDrop;
