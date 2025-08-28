<template>
  <div id="app">
    <el-container>
      <!-- 头部 -->
      <el-header class="header">
        <div class="header-content">
          <div class="logo">
            <el-icon class="logo-icon"><DataAnalysis /></el-icon>
            <span class="logo-text">TyJson工具箱</span>
          </div>
          <div class="nav">
            <el-button 
              :type="activeTab === 'parser' ? 'primary' : 'default'"
              @click="activeTab = 'parser'"
              class="nav-btn"
            >
              <el-icon><Document /></el-icon>
              JSON解析
            </el-button>
            <el-button 
              :type="activeTab === 'merge' ? 'primary' : 'default'"
              @click="activeTab = 'merge'"
              class="nav-btn"
            >
              <el-icon><Connection /></el-icon>
              JSON合并
            </el-button>
          </div>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <div class="content-wrapper">
          <!-- JSON解析工具 -->
          <div v-if="activeTab === 'parser'" class="tool-section">
            <h2 class="section-title">
              <el-icon><Document /></el-icon>
              JSON解析工具
            </h2>
            <p class="section-desc">输入JSON字符串，自动格式化并验证语法</p>
            <JsonParser />
          </div>
          
          <!-- JSON合并工具 -->
          <div v-if="activeTab === 'merge'" class="tool-section">
            <h2 class="section-title">
              <el-icon><Connection /></el-icon>
              JSON合并工具
            </h2>
            <p class="section-desc">合并相同JSON项，或者将多个JSON项中互补的字段合并成一个JSON项<br>具体效果可以加载示例，然后点击"合并数据"进行对比查看</p>
            <JsonMerger />
          </div>
        </div>
      </el-main>

      <!-- 底部 -->
      <el-footer class="footer">
        <p>&copy; 2024 TyJson工具箱. 让JSON处理更简单</p>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
import { ref } from 'vue'
import JsonParser from './components/JsonParser.vue'
import JsonMerger from './components/JsonMerger.vue'

export default {
  name: 'App',
  components: {
    JsonParser,
    JsonMerger
  },
  setup() {
    const activeTab = ref('parser')
    
    return {
      activeTab
    }
  }
}
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  font-size: 24px;
  font-weight: bold;
}

.logo-icon {
  font-size: 32px;
  margin-right: 12px;
}

.nav {
  display: flex;
  gap: 16px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.main-content {
  background: #f5f7fa;
  min-height: calc(100vh - 120px);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.tool-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 28px;
}

.section-desc {
  color: #7f8c8d;
  margin-bottom: 24px;
  font-size: 16px;
}

.footer {
  background: #2c3e50;
  color: white;
  text-align: center;
  padding: 20px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
  }
  
  .nav {
    gap: 8px;
  }
  
  .nav-btn {
    padding: 8px 16px;
    font-size: 14px;
  }
  
  .tool-section {
    padding: 20px;
  }
  
  .section-title {
    font-size: 24px;
  }
}
</style>
