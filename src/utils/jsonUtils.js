// JSON工具函数

/**
 * 验证JSON字符串是否有效
 * @param {string} jsonString - 要验证的JSON字符串
 * @returns {object} 包含验证结果和错误信息的对象
 */
export const validateJson = (jsonString) => {
  if (!jsonString || !jsonString.trim()) {
    return {
      isValid: false,
      error: 'JSON字符串不能为空'
    }
  }

  try {
    const parsed = JSON.parse(jsonString)
    return {
      isValid: true,
      data: parsed,
      error: null
    }
  } catch (error) {
    return {
      isValid: false,
      error: error.message
    }
  }
}

/**
 * 格式化JSON字符串
 * @param {string} jsonString - 要格式化的JSON字符串
 * @param {number} indent - 缩进空格数，默认为2
 * @returns {object} 包含格式化结果和错误信息的对象
 */
export const formatJson = (jsonString, indent = 2) => {
  const validation = validateJson(jsonString)
  
  if (!validation.isValid) {
    return validation
  }

  try {
    const formatted = JSON.stringify(validation.data, null, indent)
    return {
      isValid: true,
      data: validation.data,
      formatted: formatted,
      error: null
    }
  } catch (error) {
    return {
      isValid: false,
      error: `格式化失败: ${error.message}`
    }
  }
}

/**
 * 压缩JSON字符串（移除所有空格和换行）
 * @param {string} jsonString - 要压缩的JSON字符串
 * @returns {object} 包含压缩结果和错误信息的对象
 */
export const minifyJson = (jsonString) => {
  const validation = validateJson(jsonString)
  
  if (!validation.isValid) {
    return validation
  }

  try {
    const minified = JSON.stringify(validation.data)
    return {
      isValid: true,
      data: validation.data,
      minified: minified,
      error: null
    }
  } catch (error) {
    return {
      isValid: false,
      error: `压缩失败: ${error.message}`
    }
  }
}

/**
 * 获取JSON统计信息
 * @param {object|array} data - JSON数据
 * @returns {object} 包含统计信息的对象
 */
export const getJsonStats = (data) => {
  if (!data) {
    return {
      type: 'null',
      size: 0,
      depth: 0,
      keys: 0
    }
  }

  const type = Array.isArray(data) ? 'array' : typeof data
  const size = JSON.stringify(data).length
  
  // 计算深度
  const calculateDepth = (obj, currentDepth = 0) => {
    if (typeof obj !== 'object' || obj === null) {
      return currentDepth
    }
    
    let maxDepth = currentDepth
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const depth = calculateDepth(obj[key], currentDepth + 1)
        maxDepth = Math.max(maxDepth, depth)
      }
    }
    return maxDepth
  }
  
  const depth = calculateDepth(data)
  const keys = type === 'object' ? Object.keys(data).length : data.length

  return {
    type,
    size,
    depth,
    keys
  }
}

/**
 * 复制文本到剪贴板
 * @param {string} text - 要复制的文本
 * @returns {Promise<boolean>} 复制是否成功
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      textArea.remove()
      return result
    }
  } catch (error) {
    console.error('复制失败:', error)
    return false
  }
}
