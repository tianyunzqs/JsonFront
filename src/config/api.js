// API配置文件
export const API_CONFIG = {
  // 开发环境API地址
  // BASE_URL: 'http://localhost:3001',
  BASE_URL: 'https://jsonback-production.up.railway.app',
  
  // API端点
  ENDPOINTS: {
    MERGE: '/api/merge',
    VALIDATE: '/api/validate',
    FORMAT: '/api/format'
  },
  
  // 请求超时时间（毫秒）
  TIMEOUT: 10000,
  
  // 请求头
  HEADERS: {
    'Content-Type': 'application/json'
  }
}

// 获取完整的API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// 默认请求配置
export const getRequestConfig = (method = 'GET', data = null) => {
  const config = {
    method,
    headers: API_CONFIG.HEADERS,
    timeout: API_CONFIG.TIMEOUT
  }
  
  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data)
  }
  
  return config
}
