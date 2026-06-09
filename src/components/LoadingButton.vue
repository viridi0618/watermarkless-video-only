<template>
  <button
    :disabled="loading || disabled"
    class="gradient-btn text-white font-semibold text-base rounded-full py-3 px-6 w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
    :class="{ 'animate-pulse': loading }"
  >
    <!-- 加载动画 -->
    <template v-if="loading">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 loading-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span>{{ loadingText }}</span>
    </template>
    
    <!-- 默认内容 -->
    <template v-else>
      <slot />
    </template>
  </button>
</template>

<script setup>
/**
 * LoadingButton 组件 - 带加载状态的按钮
 */
defineProps({
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loadingText: {
    type: String,
    default: '处理中...',
  },
});
</script>
