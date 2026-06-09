import { ref, computed, watch } from 'vue';

const STORAGE_KEY = 'watermarkless_history';
const MAX_HISTORY = 5;

/**
 * 历史记录组合式函数
 * 管理本地存储的历史记录
 */
export function useHistory() {
  // 从 localStorage 读取历史记录
  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('读取历史记录失败:', e);
    }
    return [];
  };
  
  const history = ref(loadHistory());
  
  // 保存到 localStorage
  const saveHistory = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value));
    } catch (e) {
      console.error('保存历史记录失败:', e);
    }
  };
  
  // 监听变化自动保存
  watch(history, saveHistory, { deep: true });
  
  /**
   * 添加历史记录
   * @param {Object} record - { type, url, timestamp }
   */
  const addRecord = (record) => {
    // 移除重复记录（相同URL和类型）
    const filtered = history.value.filter(
      item => !(item.url === record.url && item.type === record.type)
    );
    
    // 添加到开头
    const newRecord = {
      ...record,
      timestamp: record.timestamp || Date.now(),
    };
    
    history.value = [newRecord, ...filtered].slice(0, MAX_HISTORY);
  };
  
  /**
   * 删除单条记录
   * @param {number} index - 记录索引
   */
  const removeRecord = (index) => {
    history.value = history.value.filter((_, i) => i !== index);
  };
  
  /**
   * 清空历史记录
   */
  const clearHistory = () => {
    history.value = [];
  };
  
  /**
   * 格式化时间戳
   * @param {number} timestamp
   */
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 小于1分钟
    if (diff < 60000) {
      return '刚刚';
    }
    // 小于1小时
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    }
    // 小于24小时
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`;
    }
    // 小于7天
    if (diff < 604800000) {
      return `${Math.floor(diff / 86400000)}天前`;
    }
    
    // 更久以前显示日期
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
  };
  
  /**
   * 截断URL显示
   * @param {string} url
   * @param {number} maxLength
   */
  const truncateUrl = (url, maxLength = 30) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + '...';
  };
  
  /**
   * 是否有历史记录
   */
  const hasHistory = computed(() => history.value.length > 0);
  
  /**
   * 历史记录数量
   */
  const historyCount = computed(() => history.value.length);
  
  return {
    // 状态
    history,
    
    // 计算属性
    hasHistory,
    historyCount,
    
    // 方法
    addRecord,
    removeRecord,
    clearHistory,
    formatTime,
    truncateUrl,
  };
}
