<template>
  <Transition
    enter-active-class="transition-all duration-200 ease-out"
    enter-from-class="opacity-0 translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div v-if="show" class="w-full mb-6">
      <!-- 进度条容器 -->
      <div class="flex items-center gap-3">
        <div class="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="[
              isComplete && !isError && !isTimeout ? 'flash-success' : '',
              isError ? 'bg-red-500' : isTimeout ? 'bg-amber-500' : 'gradient-btn',
            ]"
            :style="{ 
              width: `${progress}%`,
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
            }"
          ></div>
        </div>
        
        <!-- 百分比文字 -->
        <span 
          class="text-sm font-bold min-w-[3rem] text-right"
          :class="{
            'text-red-500': isError,
            'text-amber-500': isTimeout,
            'text-green-500': isComplete && !isError && !isTimeout,
            'text-primary-purple': !isComplete && !isError && !isTimeout,
          }"
        >
          {{ progress }}%
        </span>
      </div>
      
      <!-- 提示文字 -->
      <div class="flex items-center gap-2 mt-2">
        <!-- 状态图标 -->
        <span v-if="isComplete && !isError && !isTimeout" class="text-green-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
          </svg>
        </span>
        <span v-else-if="isError" class="text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
        </span>
        <span v-else-if="isTimeout" class="text-amber-500">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
          </svg>
        </span>
        <span v-else class="text-primary-purple">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 loading-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </span>
        
        <!-- 提示文字 -->
        <p 
          class="text-xs"
          :class="{
            'text-red-500': isError,
            'text-amber-500': isTimeout,
            'text-green-600 dark:text-green-400': isComplete && !isError && !isTimeout,
            'text-slate-500 dark:text-slate-400': !isComplete && !isError && !isTimeout,
          }"
        >
          {{ message }}
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup>
/**
 * ProgressBar 组件 - 解析进度条
 */
defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  message: {
    type: String,
    default: '',
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
  isError: {
    type: Boolean,
    default: false,
  },
  isTimeout: {
    type: Boolean,
    default: false,
  },
});
</script>
