/**
 * API Client - 중앙 집중화된 HTTP 클라이언트
 *
 * 책임:
 * - HTTP 요청/응답 처리
 * - 에러 핸들링
 * - 인터셉터 (요청/응답)
 * - 인증 토큰 관리
 */

import { API_CONFIG } from '../../config/api.config';

/**
 * API 에러 클래스
 */
export class ApiError extends Error {
  constructor(message, statusCode, response) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

/**
 * API 클라이언트
 */
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.requestInterceptors = [];
    this.responseInterceptors = [];
  }

  /**
   * 요청 인터셉터 추가
   */
  addRequestInterceptor(interceptor) {
    this.requestInterceptors.push(interceptor);
  }

  /**
   * 응답 인터셉터 추가
   */
  addResponseInterceptor(interceptor) {
    this.responseInterceptors.push(interceptor);
  }

  /**
   * 요청 인터셉터 실행
   */
  async applyRequestInterceptors(config) {
    let modifiedConfig = { ...config };

    for (const interceptor of this.requestInterceptors) {
      modifiedConfig = await interceptor(modifiedConfig);
    }

    return modifiedConfig;
  }

  /**
   * 응답 인터셉터 실행
   */
  async applyResponseInterceptors(response) {
    let modifiedResponse = response;

    for (const interceptor of this.responseInterceptors) {
      modifiedResponse = await interceptor(modifiedResponse);
    }

    return modifiedResponse;
  }

  /**
   * HTTP 요청 실행
   */
  async request(endpoint, options = {}) {
    // 기본 설정
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // 요청 인터셉터 적용
    const modifiedConfig = await this.applyRequestInterceptors(config);

    // URL 생성
    const url = `${this.baseURL}${endpoint}`;

    try {
      // 요청 실행
      const response = await fetch(url, modifiedConfig);

      // 응답 인터셉터 적용
      const modifiedResponse = await this.applyResponseInterceptors(response);

      // 에러 응답 처리
      if (!modifiedResponse.ok) {
        const errorData = await modifiedResponse.text();
        throw new ApiError(
          errorData || modifiedResponse.statusText,
          modifiedResponse.status,
          modifiedResponse
        );
      }

      // JSON 파싱
      const data = await modifiedResponse.json();
      return data;

    } catch (error) {
      // ApiError는 그대로 throw
      if (error instanceof ApiError) {
        throw error;
      }

      // 네트워크 에러 등 기타 에러
      throw new ApiError(
        error.message || 'Network error',
        0,
        null
      );
    }
  }

  /**
   * GET 요청
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  /**
   * POST 요청
   */
  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * PUT 요청
   */
  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * PATCH 요청
   */
  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * DELETE 요청
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// API 클라이언트 인스턴스 생성
const apiClient = new ApiClient(API_CONFIG.baseURL);

// 인증 토큰 인터셉터
apiClient.addRequestInterceptor(async (config) => {
  const token = localStorage.getItem('authToken');

  if (token) {
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`,
    };
  }

  return config;
});

// 응답 로깅 인터셉터 (개발 환경)
if (import.meta.env.DEV) {
  apiClient.addResponseInterceptor(async (response) => {
    console.log('API Response:', {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
    });
    return response;
  });
}

export default apiClient;
