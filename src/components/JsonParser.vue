<template>
  <div class="json-parser">
    <div class="input-section">
      <div class="input-header">
        <h3>输入JSON</h3>
        <div class="input-actions">
          <el-button @click="clearInput" type="info" size="small">
            <el-icon><Delete /></el-icon>
            清空
          </el-button>
          <el-button @click="loadSample" type="success" size="small">
            <el-icon><Document /></el-icon>
            加载示例
          </el-button>
        </div>
      </div>
      
      <el-input
        v-model="jsonInput"
        type="textarea"
        :rows="12"
        placeholder="请输入JSON字符串..."
        :class="{ 'error-input': hasError }"
        @input="validateInput"
      />
      
      <div v-if="hasError" class="error-message">
        <el-icon><Warning /></el-icon>
        <span>{{ errorMessage }}</span>
      </div>
    </div>

    <div class="actions-section">
      <el-button 
        @click="handleFormatJson" 
        type="primary" 
        size="large"
        :disabled="!jsonInput.trim() || hasError"
      >
        <el-icon><MagicStick /></el-icon>
        格式化JSON
      </el-button>
      
      <el-button 
        @click="handleMinifyJson" 
        type="success" 
        size="large"
        :disabled="!jsonInput.trim() || hasError"
      >
        <el-icon><Paperclip /></el-icon>
        压缩JSON
      </el-button>
      
      <el-button 
        @click="handleCopyToClipboard" 
        type="info" 
        size="large"
        :disabled="!formattedJson"
      >
        <el-icon><CopyDocument /></el-icon>
        复制结果
      </el-button>
    </div>

    <div v-if="formattedJson" class="output-section">
      <div class="output-header">
        <h3>JSON输出结果</h3>
        <div class="output-info">
          <el-tag type="success" size="small">
            字符数: {{ formattedJson.length }}
          </el-tag>
          <el-tag type="info" size="small">
            行数: {{ formattedJson.split('\n').length }}
          </el-tag>
          <el-tag type="warning" size="small">
            深度: {{ jsonStats.depth }}
          </el-tag>
          <el-tag type="primary" size="small">
            {{ jsonStats.type === 'array' ? '数组项' : '字段数' }}: {{ jsonStats.keys }}
          </el-tag>
        </div>
      </div>
      
      <!-- 合并的输出区域 -->
      <div class="output-container">
        <!-- 格式化JSON输出 (仅在点击压缩时显示) -->
        <div v-show="lastAction === 'minify'" class="json-output">
          <pre>{{ formattedJson }}</pre>
        </div>
        
        <!-- 树形结构输出 (仅在点击格式化时显示) -->
        <div v-show="lastAction === 'format'" class="tree-container">
          <el-tree
            :data="treeData"
            :props="treeProps"
            default-expand-all
            node-key="id"
            class="json-tree"
            :highlight-current="false"
          >
            <template #default="{ node, data }">
              <span class="tree-node">
                <span class="node-key">{{ data.key }}</span>
                <span v-if="data.type !== 'object' && data.type !== 'array'" class="node-value">
                  : {{ data.value }}
                </span>
                <el-tag v-if="data.type" size="small" :type="getTypeTagType(data.type)">
                  {{ data.type }}
                </el-tag>
              </span>
            </template>
          </el-tree>
        </div>
      </div>
      
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { validateJson, formatJson, minifyJson, getJsonStats, copyToClipboard } from '@/utils/jsonUtils'

const jsonInput = ref('')
const formattedJson = ref('')
const hasError = ref(false)
const errorMessage = ref('')
const jsonData = ref(null)
const toastMessage = ref('')
const toastType = ref('info')
const messageToast = ref(null)
const lastAction = ref('') // 记录最后一次操作是格式化还是压缩

const jsonStats = computed(() => {
  if (!jsonData.value) return { size: 0, depth: 0, keys: 0, type: 'null' }
  return getJsonStats(jsonData.value)
})

const treeData = computed(() => {
  if (!jsonData.value) return []
  return convertToTreeData(jsonData.value)
})

const treeProps = {
  children: 'children',
  label: 'key'
}

const showToast = (message, type = 'info') => {
  toastMessage.value = message
  toastType.value = type
  messageToast.value?.show()
}

const validateInput = () => {
  if (!jsonInput.value.trim()) {
    hasError.value = false
    errorMessage.value = ''
    return
  }

  const result = validateJson(jsonInput.value)
  hasError.value = !result.isValid
  errorMessage.value = result.error || ''
}

const handleFormatJson = () => {
  const result = formatJson(jsonInput.value)
  if (result.isValid) {
    jsonData.value = result.data
    formattedJson.value = result.formatted
    lastAction.value = 'format' // 记录最后一次操作
    showToast('JSON格式化成功！', 'success')
  } else {
    showToast(result.error, 'error')
  }
}

const handleMinifyJson = () => {
  const result = minifyJson(jsonInput.value)
  if (result.isValid) {
    jsonData.value = result.data
    formattedJson.value = result.minified
    lastAction.value = 'minify' // 记录最后一次操作
    showToast('JSON压缩成功！', 'success')
  } else {
    showToast(result.error, 'error')
  }
}

const handleCopyToClipboard = async () => {
  const success = await copyToClipboard(formattedJson.value)
  if (success) {
    showToast('已复制到剪贴板！', 'success')
  } else {
    showToast('复制失败！', 'error')
  }
}

const clearInput = () => {
  jsonInput.value = ''
  formattedJson.value = ''
  jsonData.value = null
  hasError.value = false
  errorMessage.value = ''
  lastAction.value = ''
}

const loadSample = () => {
  jsonInput.value = `{
  "name": "张三",
  "age": 25,
  "city": "北京",
  "hobbies": ["读书", "游泳", "编程"],
  "address": {
    "street": "中关村大街",
    "district": "海淀区",
    "postcode": "100080"
  },
  "active": true,
  "score": 95.5
}`
  validateInput()
}

const convertToTreeData = (obj, parentKey = 'root') => {
  const result = []
  let id = 0

  const processValue = (value, key) => {
    const node = {
      id: ++id,
      key: key,
      type: getValueType(value)
    }

    if (typeof value === 'object' && value !== null) {
      if (Array.isArray(value)) {
        node.children = value.map((item, index) => 
          processValue(item, `[${index}]`)
        )
      } else {
        node.children = Object.keys(value).map(k => 
          processValue(value[k], k)
        )
      }
    } else {
      node.value = String(value)
    }

    return node
  }

  if (typeof obj === 'object' && obj !== null) {
    if (Array.isArray(obj)) {
      result.push(...obj.map((item, index) => 
        processValue(item, `[${index}]`)
      ))
    } else {
      result.push(...Object.keys(obj).map(key => 
        processValue(obj[key], key)
      ))
    }
  }

  return result
}

const getValueType = (value) => {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

const getTypeTagType = (type) => {
  const typeMap = {
    string: 'success',
    number: 'warning',
    boolean: 'info',
    object: 'primary',
    array: 'danger',
    null: 'info'
  }
  return typeMap[type] || 'default'
}

// 暴露方法给父组件
defineExpose({
  validateInput,
  handleFormatJson,
  handleMinifyJson,
  handleCopyToClipboard,
  clearInput,
  loadSample
})
</script>

<style scoped>
.json-parser {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-section, .output-section {
  background: rgba(248, 250, 249, 0.13);
  border-radius: 8px;
  padding: 20px;
}

.input-header, .output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.input-header h3, .output-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 18px;
}

.input-actions {
  display: flex;
  gap: 8px;
}

.error-input {
  border-color: #f56c6c !important;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #f56c6c;
  margin-top: 8px;
  font-size: 14px;
}

.actions-section {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.output-info {
  display: flex;
  gap: 8px;
}

/* 合并后的输出区域样式 */
.output-container {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
  min-height: 200px;
}

.json-output {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 16px;
  overflow-x: auto;
  max-height: 400px;
}

.json-output pre {
  margin: 0;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
}

.tree-container {
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
}

.json-tree {
  background: transparent;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
}

.node-key {
  font-weight: 500;
  color: rgb(0, 0, 0);
}

.node-value {
  color: rgb(0, 0, 0);
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
}

.json-stats {
  margin-top: 16px;
}

.json-stats .el-row {
  display: flex;
  gap: 8px;
}

@media (max-width: 768px) {
  .actions-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .input-header, .output-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>