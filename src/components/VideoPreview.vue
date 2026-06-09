<template>
  <div class="w-full">
    <!-- 加载状态 -->
    <div v-if="loading" class="w-full flex flex-col items-center justify-center py-12">
      <div class="w-full max-w-[500px] aspect-video skeleton rounded-2xl"></div>
      <div class="flex items-center gap-2 mt-4 text-slate-500 dark:text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 loading-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-sm">正在加载视频...</span>
      </div>
    </div>
    
    <!-- 视频显示 -->
    <div v-else-if="src" class="w-full flex flex-col items-center">
      <video
        :src="src"
        controls
        class="w-full max-h-[400px] rounded-2xl shadow-lg"
        preload="metadata"
        @loadedmetadata="onVideoLoad"
        @error="onVideoError"
      >
        您的浏览器不支持视频播放。
      </video>
    </div>
    
    <!-- 空状态 -->
    <div v-else class="w-full flex flex-col items-center justify-center py-12 text-slate-400 dark:text-slate-500">
      <div class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-sm">🎬 解析后视频将显示在这里</p>
    </div>
  </div>
</template>

<script setup>
/**
 * VideoPreview 组件 - 视频预览
 */
defineProps({
  src: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['load', 'error']);

const onVideoLoad = () => {
  emit('load');
};

const onVideoError = () => {
  emit('error');
};
</script>
