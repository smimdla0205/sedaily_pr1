/**
 * 프롬프트 서비스
 *
 * 책임:
 * - 프롬프트 CRUD 작업
 * - 비즈니스 로직 처리
 * - API 클라이언트 사용
 */

import apiClient from '../lib/api/apiClient';
import { API_ENDPOINTS } from '../config/api.config';

/**
 * 프롬프트 조회 (설명, 지침, 파일 목록 포함)
 */
export const getPrompt = async (engineType) => {
  try {
    const data = await apiClient.get(API_ENDPOINTS.prompts.detail(engineType));
    return data;
  } catch (error) {
    console.error('Error fetching prompt:', error);
    throw error;
  }
};

/**
 * 모든 프롬프트 조회
 */
export const getAllPrompts = async () => {
  try {
    const data = await apiClient.get(API_ENDPOINTS.prompts.list);
    return data.prompts || [];
  } catch (error) {
    console.error('Error fetching all prompts:', error);
    throw error;
  }
};

/**
 * 프롬프트 생성
 */
export const createPrompt = async (engineType, promptData) => {
  try {
    const data = await apiClient.post(
      API_ENDPOINTS.prompts.detail(engineType),
      promptData
    );
    return data;
  } catch (error) {
    console.error('Error creating prompt:', error);
    throw error;
  }
};

/**
 * 프롬프트 업데이트 (설명, 지침)
 */
export const updatePrompt = async (engineType, updates) => {
  try {
    const data = await apiClient.put(
      API_ENDPOINTS.prompts.update(engineType),
      updates
    );
    return data;
  } catch (error) {
    console.error('Error updating prompt:', error);
    throw error;
  }
};

/**
 * 프롬프트 삭제
 */
export const deletePrompt = async (engineType) => {
  try {
    const data = await apiClient.delete(
      API_ENDPOINTS.prompts.delete(engineType)
    );
    return data;
  } catch (error) {
    console.error('Error deleting prompt:', error);
    throw error;
  }
};

/**
 * 파일 목록 조회
 */
export const getFiles = async (engineType) => {
  try {
    const data = await apiClient.get(API_ENDPOINTS.files.list(engineType));
    return data.files || [];
  } catch (error) {
    console.error('Error fetching files:', error);
    throw error;
  }
};

/**
 * 파일 추가
 */
export const addFile = async (engineType, fileData) => {
  try {
    const data = await apiClient.post(
      API_ENDPOINTS.files.create(engineType),
      {
        fileName: fileData.fileName,
        fileContent: fileData.fileContent,
      }
    );

    return data.file;
  } catch (error) {
    console.error('Error adding file:', error);
    throw error;
  }
};

/**
 * 파일 수정
 */
export const updateFile = async (engineType, fileId, updates) => {
  try {
    const data = await apiClient.put(
      API_ENDPOINTS.files.update(engineType, fileId),
      updates
    );
    return data;
  } catch (error) {
    console.error('Error updating file:', error);
    throw error;
  }
};

/**
 * 파일 삭제
 */
export const deleteFile = async (engineType, fileId) => {
  try {
    const data = await apiClient.delete(
      API_ENDPOINTS.files.delete(engineType, fileId)
    );
    return data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// 기본 export
export default {
  getPrompt,
  getAllPrompts,
  createPrompt,
  updatePrompt,
  deletePrompt,
  getFiles,
  addFile,
  updateFile,
  deleteFile,
};
