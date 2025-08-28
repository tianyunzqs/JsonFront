<template>
  <transition name="message-fade">
    <div 
      v-if="visible" 
      :class="['message-toast', `message-${type}`]"
      @click="hide"
    >
      <el-icon class="message-icon">
        <component :is="iconComponent" />
      </el-icon>
      <span class="message-text">{{ message }}</span>
    </div>
  </transition>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { 
  CircleCheck, 
  CircleClose, 
  InfoFilled, 
  Warning 
} from '@element-plus/icons-vue'

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  duration: {
    type: Number,
    default: 3000
  },
  showClose: {
    type: Boolean,
    default: true
  }
})

const visible = ref(false)
let timer = null

const iconComponent = computed(() => {
  const iconMap = {
    success: CircleCheck,
    error: CircleClose,
    warning: Warning,
    info: InfoFilled
  }
  return iconMap[props.type] || InfoFilled
})

const show = () => {
  visible.value = true
  if (props.duration > 0) {
    timer = setTimeout(() => {
      hide()
    }, props.duration)
  }
}

const hide = () => {
  visible.value = false
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

// 暴露方法给父组件
defineExpose({
  show,
  hide
})

onMounted(() => {
  show()
})
</script>

<style scoped>
.message-toast {
  position: fixed;
  top: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  z-index: 9999;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  max-width: 400px;
}

.message-success {
  background: linear-gradient(135deg, #67c23a, #85ce61);
}

.message-error {
  background: linear-gradient(135deg, #f56c6c, #f78989);
}

.message-warning {
  background: linear-gradient(135deg, #e6a23c, #ebb563);
}

.message-info {
  background: linear-gradient(135deg, #409eff, #66b1ff);
}

.message-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.message-text {
  flex: 1;
  word-break: break-word;
  line-height: 1.4;
}

/* 动画效果 */
.message-fade-enter-active,
.message-fade-leave-active {
  transition: all 0.3s ease;
}

.message-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.message-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@media (max-width: 768px) {
  .message-toast {
    top: 10px;
    right: 10px;
    left: 10px;
    min-width: auto;
    max-width: none;
  }
}
</style>
