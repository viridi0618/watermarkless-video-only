<template>
  <div v-if="hasHistory" class="w-full mt-6">
    <!-- 标题栏 -->
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        最近记录
      </h3>
      <button
        @click="clearHistory"
        class="text-xs text-slate-400 hover:text-red-500 transition-colors duration-200"
      >
        清空历史
      </button>
    </div>
    
    <!-- 历史记录列表 -->
    <div class="space-y-2">
      <div
        v-for="(item, index) in history"
        :key="index"
        class="glass-card rounded-xl p-3 flex items-center gap-3 group hover:shadow-md transition-all duration-200 cursor-pointer"
        @click="handleClick(item)"
      >
        <!-- 类型图标 -->
        <div class="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
          <span class="text-sm">{{ item.type === 'image' ? '🖼️' : '🎬' }}</span>
        </div>
        
        <!-- 链接和时间 -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-slate-700 dark:text-slate-300 truncate">
            {{ truncateUrl(item.url) }}
          </p>
          <p class="text-xs text-slate-400 mt-0.5">
            {{ formatTime(item.timestamp) }}
          </p>
        </div>
        
        <!-- 重新解析按钮 -->
        <button
          @click.stop="handleReparse(item)"
          class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-primary-purple"
          title="重新解析"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * HistoryList 组件 - 历史记录列表
 */
import { useHistory } from '../composables/useHistory.js';

const { history, hasHistory, clearHistory, formatTime, truncateUrl } = useHistory();

const emit = defineEmits(['select', 'reparse']);

/**
 * 点击历史记录
 */
const handleClick = (item) => {
  emit('select', item);
};

/**
 * 重新解析
 */
const handleReparse = (item) => {
  emit('reparse', item);
};
</script>
