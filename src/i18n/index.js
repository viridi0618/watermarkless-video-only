/**
 * i18n 国际化模块
 * 支持中/英文切换，localStorage 记忆，URL /en 路径检测
 */
import { ref } from 'vue'

const LOCALE_KEY = 'watermarkless_locale'

const messages = {
  zh: {
    // ─── 头部 ───
    subtitle: '视频 无水印提取',

    // ─── 输入框 ───
    inputPlaceholder: '🔗 粘贴豆包视频分享链接...',

    // ─── 按钮 ───
    extractBtn: '提取无水印视频',
    loadingExtract: '正在提取...',
    downloadBtn: '下载视频',
    downloading: '正在下载...',

    // ─── 频率限制 ───
    remainingToday: (n) => `今日剩余次数：${n}/10`,
    rateLimitExceeded: '今日免费次数已用完，请明日0点后再试',

    // ─── 进度条消息 ───
    verifyingLink: '正在验证链接...',
    extractingVideo: '正在提取视频源...',
    invalidLink: '无效链接',
    invalidLinkFormat: '链接格式无效',
    done: '完成！',
    resolveTimeout: '解析超时',
    resolveFailed: '解析失败',

    // ─── API 错误 ───
    apiErrPrefix: 'API 错误',
    apiNoUrl: 'API 未返回有效的 URL',

    // ─── 历史记录 ───
    recentRecords: '最近记录',
    clearHistory: '清空历史',
    reparseTitle: '重新解析',

    // ─── 时间格式 (useHistory) ───
    justNow: '刚刚',
    minutesAgo: (n) => `${n}分钟前`,
    hoursAgo: (n) => `${n}小时前`,
    daysAgo: (n) => `${n}天前`,

    // ─── 页脚 ───
    footerLine1: '本工具仅供提取用户本人在豆包平台生成的原创内容 ·',
    footerLine2: '请勿去除他人作品的水印 ·',
    footerLine3: '用户使用产生的法律纠纷由用户自行承担',
    copyright: 'WatermarkLess Video © 2026',

    // ─── 语言切换 ───
    switchLang: 'English',

    // ─── 下载错误 ───
    downloadError: '浏览器安全策略限制，\n请右键点击视频 → 选择"视频另存为..."来保存文件。',
  },

  en: {
    subtitle: 'Video Watermark Removal',

    inputPlaceholder: '🔗 Paste Doubao video share link...',

    extractBtn: 'Extract Watermark-Free Video',
    loadingExtract: 'Extracting...',
    downloadBtn: 'Download Video',
    downloading: 'Downloading...',

    remainingToday: (n) => `Remaining today: ${n}/10`,
    rateLimitExceeded: 'Daily free limit reached. Please try again after midnight.',

    verifyingLink: 'Verifying link...',
    extractingVideo: 'Extracting video source...',
    invalidLink: 'Invalid link',
    invalidLinkFormat: 'Invalid link format',
    done: 'Done!',
    resolveTimeout: 'Resolve timeout',
    resolveFailed: 'Resolve failed',

    apiErrPrefix: 'API Error',
    apiNoUrl: 'API did not return a valid URL',

    recentRecords: 'Recent Records',
    clearHistory: 'Clear History',
    reparseTitle: 'Reparse',

    justNow: 'Just now',
    minutesAgo: (n) => `${n} min ago`,
    hoursAgo: (n) => `${n} hr ago`,
    daysAgo: (n) => `${n} day${n > 1 ? 's' : ''} ago`,

    footerLine1: 'This tool is for extracting your own original content from Doubao platform ·',
    footerLine2: 'Do not remove watermarks from others\' work ·',
    footerLine3: 'Users are solely responsible for any legal issues arising from use',
    copyright: 'WatermarkLess Video © 2026',

    switchLang: '中文',

    downloadError: 'Browser security restriction.\nRight-click the video → "Save video as..." to save.',
  },
}

// ─── 模块级全局状态 ───
const locale = ref(detectInitialLocale())

function detectInitialLocale() {
  // 1. URL 路径检测
  const path = window.location.pathname
  if (path.startsWith('/en')) return 'en'
  // 2. localStorage 记忆
  const stored = localStorage.getItem(LOCALE_KEY)
  if (stored === 'en' || stored === 'zh') return stored
  // 3. 默认中文
  return 'zh'
}

/**
 * 获取翻译文本（可在 Vue 和非 Vue 文件中使用）
 * @param {string} key   - 翻译键名
 * @param {...any}  args - 传递给翻译函数（如果是函数类型）的参数
 */
function t(key, ...args) {
  const msg = messages[locale.value] != null && messages[locale.value][key] !== undefined
    ? messages[locale.value][key]
    : (messages.zh[key] !== undefined ? messages.zh[key] : key)
  return typeof msg === 'function' ? msg(...args) : msg
}

/**
 * 切换语言并持久化
 */
function setLocale(loc) {
  locale.value = loc
  localStorage.setItem(LOCALE_KEY, loc)
  // 更新 URL path
  const newPath = loc === 'en' ? '/en' : '/'
  window.history.replaceState(null, '', newPath)
  // 更新 <html lang>
  document.documentElement.lang = loc === 'en' ? 'en' : 'zh-CN'
  // 更新页面标题
  document.title = loc === 'en'
    ? 'WatermarkLess Video - Download Watermark-Free Videos'
    : 'WatermarkLess Video - 视频去水印'
}

function toggleLang() {
  setLocale(locale.value === 'zh' ? 'en' : 'zh')
}

/**
 * Vue composable — 在组件 setup 中调用
 */
export function useI18n() {
  return { locale, t, setLocale, toggleLang }
}

// 同时导出模块级函数，方便非 Vue 文件引用
export { locale, t, setLocale, toggleLang }
