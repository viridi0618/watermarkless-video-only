<template>
  <div class="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
    <div class="w-[90%] max-w-[500px] mx-auto py-8 px-4">
      <Header />

      <div class="glass-card rounded-card shadow-xl p-6">
        <div class="relative mb-4">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <input v-model="inputUrl" type="text" placeholder="&#x1F517; 粘贴豆包视频分享链接..."
            class="w-full pl-11 pr-4 py-3.5 rounded-input border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm input-focus transition-all duration-200" @keyup.enter="handleExtract" />
        </div>


        <LoadingButton :loading="isParsing" :disabled="!inputUrl.trim() || remaining === 0" loading-text="正在提取..." @click="handleExtract">
          <span>&#x1F3AC;</span><span>提取无水印视频</span>
        </LoadingButton>
        <p v-if="remaining > 0" class="text-xs text-slate-400 dark:text-slate-500 text-center mt-2">今日剩余次数：{{ remaining }}/10</p>
        <p v-else class="text-xs text-amber-500 dark:text-amber-400 text-center mt-2">今日免费次数已用完，请明日0点后再试</p>

        <ProgressBar :show="showProgress" :progress="progress" :message="progressMessage" :is-complete="isComplete" :is-error="isError" :is-timeout="isTimeout" />

        <div class="mt-6">
          <VideoPreview :src="result" :loading="isParsing && progress < 70" @load="onPreviewLoad" @error="onPreviewError" />
        </div>

        <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 translate-y-4" enter-to-class="opacity-100 translate-y-0">
          <div v-if="showResult" class="mt-6">
            <button @click="handleDownload" :disabled="downloading" class="gradient-btn text-white font-semibold text-base rounded-full py-3 px-6 w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed" :class="{ 'animate-pulse': downloading }">
              <template v-if="downloading">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 loading-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                <span>正在下载...</span>
              </template>
              <template v-else><span>&#x2B07;&#xFE0F;</span><span>下载视频</span></template>
            </button>
          </div>
        </Transition>

        <HistoryList @select="handleHistorySelect" @reparse="handleHistoryReparse" />
      </div>

      <footer class="mt-8 text-center">
        <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <p class="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">本工具仅供提取用户本人在豆包平台生成的原创内容 ·</p>
          <p class="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">请勿去除他人作品的水印 ·</p>
          <p class="text-[10px] leading-relaxed text-slate-400 dark:text-slate-500">用户使用产生的法律纠纷由用户自行承担</p>
        </div>
        <p class="text-xs text-slate-400 dark:text-slate-500 mt-4">WatermarkLess Video &copy; 2026</p>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import Header from './components/Header.vue';
import ProgressBar from './components/ProgressBar.vue';
import VideoPreview from './components/VideoPreview.vue';
import HistoryList from './components/HistoryList.vue';
import LoadingButton from './components/LoadingButton.vue';
import { useParser } from './composables/useParser.js';
import { useHistory } from './composables/useHistory.js';
import { getLastRemaining, getLocalRemaining } from './services/parser.js';


const inputUrl = ref('');
const { isParsing, progress, progressMessage, result, isComplete, isError, isTimeout, showResult, showProgress, startParse } = useParser();
const { addRecord } = useHistory();
const downloading = ref(false);
const remaining = ref(getLocalRemaining());

const downloadFileName = computed(() => {
  const t = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const m = result.value?.match(/\.(\w+)(?:\?|$)/);
  return 'watermarkless_' + t + '.' + (m ? m[1] : 'mp4');
});

const handleDownload = async () => {
  if (!result.value || downloading.value) return;
  downloading.value = true;
  try {
    const r = await fetch(result.value, { mode: 'cors' });
    if (r.ok) {
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = downloadFileName.value;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      downloading.value = false;
      return;
    }
  } catch (e) {}
  try {
    const blob = await new Promise((res, rej) => {
      const x = new XMLHttpRequest(); x.open('GET', result.value, true); x.responseType = 'blob';
      x.onload = () => x.status === 200 ? res(x.response) : rej(); x.onerror = () => rej();
      x.setRequestHeader('Origin', location.origin); x.send();
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = downloadFileName.value;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (e) { alert('浏览器安全策略限制，\n请右键点击视频 → 选择"视频另存为..."来保存文件。'); }
  downloading.value = false;
};

const handleExtract = async () => {
  const u = inputUrl.value.trim();
  if (!u) return;
  const r = await startParse(u, 'video');
  remaining.value = getLocalRemaining();
  if (r) addRecord({ type: 'video', url: u, timestamp: Date.now() });
};

const handleHistorySelect = (i) => { inputUrl.value = i.url; };
const handleHistoryReparse = (i) => { inputUrl.value = i.url; setTimeout(() => handleExtract(), 100); };
const onPreviewLoad = () => {};
const onPreviewError = () => {};
</script>