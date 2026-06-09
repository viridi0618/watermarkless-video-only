const RATE_LIMIT_KEY = 'watermarkless_ratelimit';
const DAILY_LIMIT = 10;

function getTodayStr() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function loadRateLimit() {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const today = getTodayStr();
      if (data.date === today) {
        return data;
      }
    }
  } catch (e) {}
  const reset = { date: getTodayStr(), count: 0 };
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(reset));
  return reset;
}

function saveRateLimit(count) {
  try {
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify({ date: getTodayStr(), count }));
  } catch (e) {}
}

export function getLocalRemaining() {
  const data = loadRateLimit();
  return Math.max(0, DAILY_LIMIT - data.count);
}

export function checkLocalRateLimit() {
  const remaining = getLocalRemaining();
  if (remaining <= 0) {
    throw new Error('今日免费次数已用完，请明日0点后再试');
  }
}

export function incrementLocalCount() {
  const data = loadRateLimit();
  data.count += 1;
  saveRateLimit(data.count);
  _lastRemaining = Math.max(0, DAILY_LIMIT - data.count);
}

let _lastRemaining = 10;
export function getLastRemaining() {
  return _lastRemaining;
}

export function validateUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return /^https?:\/\/.+/i.test(url);
}

async function parseViaApi(url) {
  checkLocalRateLimit();
  const response = await fetch('/api/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type: 'video' }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'API Error (' + response.status + ')');
  }
  const data = await response.json();
  if (!data.url) throw new Error('API did not return a valid URL');
  incrementLocalCount();
  return data.url;
}

export async function parseDoubaoVideo(url) {
  try {
    const result = await parseViaApi(url);
    return '/api/proxy?url=' + encodeURIComponent(result);
  } catch (err) {
    console.warn('Video API error:', err.message);
    return '/api/proxy?url=' + encodeURIComponent(url);
  }
}

export async function parseContentWithProgress(url, onProgress) {
  onProgress(0, 'Verifying link...');
  if (!validateUrl(url)) {
    onProgress(0, 'Invalid link');
    throw new Error('Invalid link format');
  }
  onProgress(20, 'Verifying link...');
  onProgress(20, 'Extracting video source...');

  let result;
  try {
    result = await parseDoubaoVideo(url);
  } catch (error) {
    onProgress(0, error.message);
    throw error;
  }
  onProgress(100, 'Done!');
  return result;
}