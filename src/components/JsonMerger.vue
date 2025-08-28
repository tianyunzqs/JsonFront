<template>
  <div class="json-merger">
    <el-tabs v-model="activeTab" class="merger-tabs" @tab-change="handleTabChange">
      <!-- Tab 1: 手动输入JSON数据 -->
      <el-tab-pane label="手动输入" name="manual">
        <div class="input-section">
          <h3>输入JSON数据集</h3>
          <div class="datasets-container">
            <div v-for="(dataset, index) in datasets" :key="index" class="dataset-item">
              <h4>数据集 {{ index + 1 }}</h4>
              <el-input
                v-model="dataset.data"
                type="textarea"
                :rows="6"
                placeholder="请输入JSON数组..."
              />
              <el-button @click="removeDataset(index)" type="danger" size="small">
                删除
              </el-button>
            </div>
          </div>
          
          <div class="actions">
            <el-button @click="addDataset" type="primary">添加数据集</el-button>
            <el-button @click="loadSample" type="success">加载示例</el-button>
            <el-button @click="mergeDatasets" type="warning" :loading="isLoading">
              {{ isLoading ? '合并中...' : '合并数据' }}
            </el-button>
            <el-button @click="clearAll" type="info">清空所有</el-button>
          </div>
        </div>

        <div v-if="mergeResult" class="result-section">            
          <!-- 统计信息 -->
          <div class="output-header">
            <h3>合并结果</h3>
            <div class="output-info">
              <el-tag type="success" size="small">
                输入记录数: {{ summary.inputRecords }}
              </el-tag>
              <el-tag type="info" size="small">
                输出记录数: {{ summary.outputRecords }}
              </el-tag>
              <el-tag type="warning" size="small">
                字段数量: {{ summary.columns.length }}
              </el-tag>
            </div>
          </div>

          <!-- 数据表格 -->
          <div class="table-container">
            <el-table :data="mergeResult" border stripe max-height="400">
              <el-table-column 
                v-for="col in summary.columns" 
                :key="col"
                :prop="col"
                :label="col"
                show-overflow-tooltip
              />
            </el-table>
          </div>

          <!-- 操作按钮 -->
          <div class="result-actions">
            <el-button @click="copyResult" type="primary">
              <el-icon><CopyDocument /></el-icon>
              复制结果
            </el-button>
            <el-button @click="downloadResult" type="success">
              <el-icon><Download /></el-icon>
              下载JSON
            </el-button>
          </div>
        </div>
      </el-tab-pane>

      <!-- Tab 2: 文件上传 -->
      <el-tab-pane label="文件上传" name="file">
        <div class="file-upload-section">
          <h3>上传文件进行合并</h3>
          <div class="upload-container">
            <el-upload
              drag
              multiple
              :auto-upload="false"
              :on-change="handleFileChange"
              :on-remove="handleFileRemove"
              :file-list="fileList"
              accept=".json,.jsonl,.xlsx,.xls,.csv"
              ref="uploadRef"
            >
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="el-upload__text">
                将文件拖到此处，或<em>点击上传</em>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  支持 JSON、JSONL、Excel 和 CSV 文件格式，可上传多个文件
                </div>
              </template>
            </el-upload>
            
            <div class="file-actions">
              <el-button 
                @click="uploadAndMerge" 
                type="warning" 
                :loading="isLoading"
                :disabled="fileList.length === 0"
              >
                {{ isLoading ? '合并中...' : '上传并合并' }}
              </el-button>
              <el-button @click="clearFile" type="info">清空文件</el-button>
            </div>
          </div>
        </div>

        <div v-if="mergeResult" class="result-section">            
          <!-- 统计信息 -->
          <div class="output-header">
            <h3>合并结果</h3>
            <div class="output-info">
              <el-tag type="success" size="small">
                输入记录数: {{ summary.inputRecords }}
              </el-tag>
              <el-tag type="info" size="small">
                输出记录数: {{ summary.outputRecords }}
              </el-tag>
              <el-tag type="warning" size="small">
                字段数量: {{ summary.columns.length }}
              </el-tag>
            </div>
          </div>

          <!-- 数据表格 -->
          <div class="table-container">
            <el-table :data="mergeResult" border stripe max-height="400">
              <el-table-column 
                v-for="col in summary.columns" 
                :key="col"
                :prop="col"
                :label="col"
                show-overflow-tooltip
              />
            </el-table>
          </div>

          <!-- 操作按钮 -->
          <div class="result-actions">
            <el-button @click="copyResult" type="primary">
              <el-icon><CopyDocument /></el-icon>
              复制结果
            </el-button>
            <el-button @click="downloadResult" type="success">
              <el-icon><Download /></el-icon>
              下载JSON
            </el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { CopyDocument, Download, UploadFilled } from '@element-plus/icons-vue'
import MessageToast from './MessageToast.vue'
import { getApiUrl } from '@/config/api'

// Tab 控制
const activeTab = ref('manual')

// 手动输入相关数据
const datasets = ref([{ data: '' }])
const mergeResult = ref(null)
const summary = ref({
  inputRecords: 0,
  outputRecords: 0,
  columns: []
})
const isLoading = ref(false)
const toastMessage = ref('')
const toastType = ref('info')
const messageToast = ref(null)

// 文件上传相关数据
const fileList = ref([])
const uploadRef = ref(null)

// 手动输入相关方法
const addDataset = () => {
  datasets.value.push({ data: '' })
}

const removeDataset = (index) => {
  if (datasets.value.length > 1) {
    datasets.value.splice(index, 1)
  }
}

const loadSample = () => {
  const sampleData = [
    {"name": "张三", "age": 25, "city": "北京", "dept": "技术部"},
    {"name": "李四", "age": 30, "city": "上海", "dept": "市场部"},
    {"name": "张三", "age": 25, "city": "", "dept": ""},
    {"name": "赵六", "age": 32, "city": "深圳", "dept": "人事部"}
  ];
  
  datasets.value[0].data = JSON.stringify(sampleData, null, 2);
  
  if (datasets.value.length > 1) {
    datasets.value = [datasets.value[0]];
  }
}

const clearAll = () => {
  datasets.value = [{ data: '' }]
  mergeResult.value = null
  summary.value = {
    inputRecords: 0,
    outputRecords: 0,
    columns: []
  }
}

const showToast = (message, type = 'info') => {
  toastMessage.value = message
  toastType.value = type
  messageToast.value?.show()
}

const mergeDatasets = async () => {
  try {
    const allData = []
    let totalRecords = 0
    
    for (const dataset of datasets.value) {
      if (dataset.data.trim()) {
        try {
          const parsed = JSON.parse(dataset.data)
          if (Array.isArray(parsed)) {
            allData.push(...parsed)
            totalRecords += parsed.length
          } else {
            showToast('数据集必须是JSON数组格式', 'error')
            return
          }
        } catch (error) {
          showToast(`数据集${datasets.value.indexOf(dataset) + 1}格式错误: ${error.message}`, 'error')
          return
        }
      }
    }

    if (allData.length === 0) {
      showToast('请至少输入一个有效的数据集', 'warning')
      return
    }

    isLoading.value = true

    const response = await fetch(getApiUrl('/api/merge'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        datasets: allData
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.success) {
      mergeResult.value = result.data
      summary.value = result.summary || {
        inputRecords: totalRecords,
        outputRecords: result.data.length,
        columns: result.data.length > 0 ? Object.keys(result.data[0]) : []
      }
      showToast('数据合并成功！', 'success')
    } else {
      showToast(result.msg_error || '合并失败', 'error')
    }

  } catch (error) {
    console.error('合并失败:', error)
    showToast(`合并失败: ${error.message}`, 'error')
  } finally {
    isLoading.value = false
  }
}

// 文件上传相关方法
const handleFileChange = (uploadFile, uploadFileList) => {
  // 更新文件列表
   fileList.value = uploadFileList
}

const handleFileRemove = (uploadFile, uploadFileList) => {
  // 更新文件列表
  fileList.value = uploadFileList
}

const clearFile = () => {
  uploadRef.value?.clearFiles()
  fileList.value = []
  mergeResult.value = null
  summary.value = {
    inputRecords: 0,
    outputRecords: 0,
    columns: []
  }
}

const uploadAndMerge = async () => {
  if (fileList.value.length === 0) {
    showToast('请先选择文件', 'warning')
    return
  }

  try {
    isLoading.value = true
    
    const formData = new FormData()
    // 添加所有文件到表单数据中，使用正确的字段名'files'
    fileList.value.forEach(file => {
      if (file.raw) {
        formData.append('files', file.raw)
      } else if (file instanceof File) {
        formData.append('files', file)
      }
    })
    
    const response = await fetch(getApiUrl('/api/merge-with-file'), {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const result = await response.json()

    if (result.success) {
      mergeResult.value = result.data
      summary.value = result.summary || {
        inputRecords: 0,
        outputRecords: result.data.length,
        columns: result.data.length > 0 ? Object.keys(result.data[0]) : []
      }
      showToast('文件上传并合并成功！', 'success')
    } else {
      showToast(result.msg_error || '合并失败', 'error')
    }

  } catch (error) {
    console.error('文件上传失败:', error)
    showToast(`文件上传失败: ${error.message}`, 'error')
  } finally {
    isLoading.value = false
  }
}

// 处理tab切换事件
const handleTabChange = (tabName) => {
  // 切换tab时清空结果
  mergeResult.value = null
  summary.value = {
    inputRecords: 0,
    outputRecords: 0,
    columns: []
  }
  
  // 如果切换到手动输入tab，确保至少有一个数据集
  if (tabName === 'manual' && datasets.value.length === 0) {
    datasets.value.push({ data: '' })
  }
}

const copyResult = async () => {
  try {
    const resultText = JSON.stringify(mergeResult.value, null, 2)
    await navigator.clipboard.writeText(resultText)
    showToast('结果已复制到剪贴板！', 'success')
  } catch (error) {
    showToast('复制失败！', 'error')
  }
}

const downloadResult = () => {
  try {
    const resultText = JSON.stringify(mergeResult.value, null, 2)
    const blob = new Blob([resultText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'merged_data.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showToast('文件下载成功！', 'success')
  } catch (error) {
    showToast('下载失败！', 'error')
  }
}

// 暴露方法给父组件
defineExpose({
  addDataset,
  removeDataset,
  loadSample,
  mergeDatasets,
  clearAll
})
</script>

<style scoped>
.json-merger {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.merger-tabs {
  width: 100%;
}

.input-header, .output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.input-section, .file-upload-section, .result-section {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.file-upload-section h3 {
  margin-top: 0;
}

.upload-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.file-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

.output-info {
  display: flex;
  gap: 8px;
}

.datasets-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 16px 0;
}

.dataset-item {
  background: white;
  border-radius: 6px;
  padding: 16px;
  border: 1px solid #e4e7ed;
}

.dataset-item h4 {
  margin-bottom: 12px;
  color: #2c3e50;
  font-size: 16px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
}

.summary-info {
  margin-bottom: 20px;
}

.summary-item {
  text-align: center;
  padding: 10px;
}

.summary-label {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 8px;
}

.summary-value {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
}

.table-container {
  margin-bottom: 20px;
}

.result-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

h3 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 18px;
}

@media (max-width: 768px) {
  .actions,
  .result-actions,
  .file-actions {
    flex-direction: column;
  }
  
  .summary-info .el-col {
    margin-bottom: 16px;
  }
}
</style>