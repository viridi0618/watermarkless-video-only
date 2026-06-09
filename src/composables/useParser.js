import { ref, computed } from 'vue';
import { parseContentWithProgress } from '../services/parser.js';

export function useParser() {
  const isParsing = ref(false);
  const progress = ref(0);
  const progressMessage = ref('');
  const result = ref(null);
  const isComplete = ref(false);
  const isError = ref(false);
  const isTimeout = ref(false);
  let timeoutTimer = null;
  const TIMEOUT_MS = 30000;

  const onProgress = (v, m) => { progress.value = v; progressMessage.value = m; };

  const reset = () => {
    isParsing.value = false; progress.value = 0; progressMessage.value = '';
    result.value = null; isComplete.value = false; isError.value = false; isTimeout.value = false;
    if (timeoutTimer) { clearTimeout(timeoutTimer); timeoutTimer = null; }
  };

  const startParse = async (url, type) => {
    reset();
    isParsing.value = true;
    timeoutTimer = setTimeout(() => {
      if (isParsing.value) {
        isTimeout.value = true; isParsing.value = false;
        progress.value = 100; progressMessage.value = 'Resolve timeout';
      }
    }, TIMEOUT_MS);
    try {
      const parsedUrl = await parseContentWithProgress(url, onProgress);
      result.value = parsedUrl; isComplete.value = true; isParsing.value = false;
      if (timeoutTimer) { clearTimeout(timeoutTimer); timeoutTimer = null; }
      return parsedUrl;
    } catch (err) {
      isParsing.value = false; isError.value = true; progress.value = 100;
      progressMessage.value = err.message || 'Resolve failed';
      if (timeoutTimer) { clearTimeout(timeoutTimer); timeoutTimer = null; }
      return null;
    }
  };

  const showResult = computed(() => isComplete.value && result.value && !isError.value && !isTimeout.value);
  const showProgress = computed(() => isParsing.value || isComplete.value || isError.value || isTimeout.value);

  return { isParsing, progress, progressMessage, result, isComplete, isError, isTimeout, showResult, showProgress, startParse, reset };
}
