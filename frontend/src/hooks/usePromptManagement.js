/**
 * 프롬프트 관리 훅
 *
 * 책임:
 * - 프롬프트 상태 관리
 * - 프롬프트 CRUD 로직
 * - 파일 관리 로직
 */

import { useState, useCallback } from 'react';
import * as promptService from '../services/promptService';

export const usePromptManagement = (engineType) => {
  // 상태
  const [prompt, setPrompt] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 프롬프트 로드
   */
  const loadPrompt = useCallback(async () => {
    if (!engineType) return;

    setLoading(true);
    setError(null);

    try {
      const data = await promptService.getPrompt(engineType);

      if (data.prompt) {
        setPrompt(data.prompt);
      }

      if (data.files) {
        setFiles(data.files);
      }
    } catch (err) {
      console.error('Failed to load prompt:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [engineType]);

  /**
   * 프롬프트 업데이트
   */
  const updatePrompt = useCallback(async (updates) => {
    if (!engineType) return false;

    setSaving(true);
    setError(null);

    try {
      await promptService.updatePrompt(engineType, updates);

      // 상태 업데이트
      setPrompt((prev) => ({
        ...prev,
        ...updates,
      }));

      return true;
    } catch (err) {
      console.error('Failed to update prompt:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [engineType]);

  /**
   * 파일 추가
   */
  const addFile = useCallback(async (fileData) => {
    if (!engineType) return null;

    setSaving(true);
    setError(null);

    try {
      const newFile = await promptService.addFile(engineType, fileData);

      // 파일 목록에 추가
      setFiles((prev) => [...prev, newFile]);

      return newFile;
    } catch (err) {
      console.error('Failed to add file:', err);
      setError(err.message);
      return null;
    } finally {
      setSaving(false);
    }
  }, [engineType]);

  /**
   * 파일 업데이트
   */
  const updateFile = useCallback(async (fileId, updates) => {
    if (!engineType) return false;

    setSaving(true);
    setError(null);

    try {
      await promptService.updateFile(engineType, fileId, updates);

      // 파일 목록 업데이트
      setFiles((prev) =>
        prev.map((file) =>
          file.fileId === fileId ? { ...file, ...updates } : file
        )
      );

      return true;
    } catch (err) {
      console.error('Failed to update file:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [engineType]);

  /**
   * 파일 삭제
   */
  const deleteFile = useCallback(async (fileId) => {
    if (!engineType) return false;

    setSaving(true);
    setError(null);

    try {
      await promptService.deleteFile(engineType, fileId);

      // 파일 목록에서 제거
      setFiles((prev) => prev.filter((file) => file.fileId !== fileId));

      return true;
    } catch (err) {
      console.error('Failed to delete file:', err);
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  }, [engineType]);

  /**
   * 에러 초기화
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // 상태
    prompt,
    files,
    loading,
    saving,
    error,

    // 액션
    loadPrompt,
    updatePrompt,
    addFile,
    updateFile,
    deleteFile,
    clearError,
  };
};

export default usePromptManagement;
