/**
 * WatermarkLess - Video Only API
 * Vercel Serverless Function
 * 
 * 视频解析（参考 doubao-nomark 项目）：
 *   调用 /samantha/media/get_play_info 接口（带特定查询参数）
 *   返回 original_media_info.main_url 无水印版本
 * 
 * POST /api/parse
 * Body: { url: string }
 * Response: { url: string, remaining: number } | { error: string, remaining: number }
 * 
 * 使用限制：每个 IP 每天最多 10 次成功解析
 */

const DOUBAO_ORIGIN = 'https://www.doubao.com';

const COMMON_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Origin': DOUBAO_ORIGIN,
  'Referer': DOUBAO_ORIGIN + '/',
};

// Rate limiting
const rateLimitMap = new Map();
const DAILY_LIMIT = 10;

function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.socket.remoteAddress || '127.0.0.1';
}

function getDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`;
}

function checkRateLimit(ip) {
  const today = getDateStr();
  const key = `${ip}:${today}`;
  const entry = rateLimitMap.get(key);
  if (!entry) {
    rateLimitMap.set(key, { date: today, count: 0, remaining: DAILY_LIMIT });
    for (const [k, v] of rateLimitMap) {
      if (!k.endsWith(today)) rateLimitMap.delete(k);
    }
    return { allowed: true, remaining: DAILY_LIMIT };
  }
  if (entry.count >= DAILY_LIMIT) return { allowed: false, remaining: 0 };
  return { allowed: true, remaining: DAILY_LIMIT - entry.count };
}

function incrementCount(ip) {
  const today = getDateStr();
  const key = `${ip}:${today}`;
  const entry = rateLimitMap.get(key);
  if (entry) {
    entry.count += 1;
    entry.remaining = Math.max(0, DAILY_LIMIT - entry.count);
    return entry.remaining;
  }
  rateLimitMap.set(key, { date: today, count: 1, remaining: DAILY_LIMIT - 1 });
  return DAILY_LIMIT - 1;
}


export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only', remaining: 0 });

  const { url } = req.body;
  if (!url || typeof url !== 'string') return res.status(400).json({ error: 'Missing url', remaining: 0 });

  const clientIP = getClientIP(req);
  const { allowed, remaining } = checkRateLimit(clientIP);
  if (!allowed) {
    return res.status(429).json({ error: '今日免费次数已用完，请明日0点后再试', remaining: 0 });
  }

  try {
    const resultUrl = await parseVideo(url);
    if (!resultUrl) return res.status(400).json({ error: 'No watermark-free video found', remaining });
    const newRemaining = incrementCount(clientIP);
    return res.status(200).json({ url: resultUrl, remaining: newRemaining });
  } catch (err) {
    console.error('Parse error:', err);
    return res.status(500).json({ error: 'Parse failed: ' + err.message, remaining });
  }
}

// ============================================================
//  视频解析
//  参考 doubao-nomark: 调用 /samantha/media/get_play_info 获取无水印视频
//  参数: { key: vid } + query params (version_code, aid, pc_version 等)
//  响应路径: data.original_media_info.main_url
// ============================================================

async function parseVideo(url) {
  const vid = await extractVid(url);
  if (!vid) return null;

  try {
    return await getMediaPlayInfo(vid);
  } catch (err) {
    console.warn('doubao video parse failed:', err.message);
    try {
      const shareId = extractQueryParam(url, 'share_id');
      const creationId = extractQueryParam(url, 'creation_id');
      if (shareId) {
        return await getVideoShareInfo(shareId, vid, creationId);
      }
    } catch (e2) {
      console.warn('doubao fallback also failed:', e2.message);
    }
    return null;
  }
}

/**
 * 从链接中提取视频 ID (vid)
 */
async function extractVid(url) {
  let v = extractQueryParam(url, 'video_id');
  if (v) return v;
  if (url.includes('/thread/')) {
    try {
      const html = await fetchPageHtml(url);
      if (html) {
        const m1 = html.match(/vid(?:\\\\)?&quot;(?:\\\\)?:\s*(?:\\\\)?&quot;(.*?)(?:\\\\)?&quot;/);
        if (m1) return m1[1];
        const m2 = html.match(/"vid"\s*:\s*"([^"]+)"/);
        if (m2) return m2[1];
      }
    } catch { return null; }
  }
  return null;
}

/**
 * 调用 /samantha/media/get_play_info 获取无水印视频
 * 参考 doubao-nomark/video.py + Edge 扩展 content.js
 * 不依赖登录 Cookie，使用特定 query 参数
 */
async function getMediaPlayInfo(vid) {
  const params = new URLSearchParams({
    version_code: '20800', language: 'zh-CN', device_platform: 'web',
    aid: '497858', real_aid: '497858', pkg_type: 'release_version',
    device_id: '', pc_version: '2.51.7', region: '', sys_region: '',
    samantha_web: '1', 'use-olympus-account': '1', web_tab_id: '',
  });

  const response = await fetch(`${DOUBAO_ORIGIN}/samantha/media/get_play_info?${params.toString()}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126.0.0.0 Safari/537.36',
      'Origin': DOUBAO_ORIGIN, 'Referer': DOUBAO_ORIGIN + '/',
    },
    body: JSON.stringify({ key: vid }),
  });

  if (!response.ok) throw new Error('API HTTP ' + response.status);
  const data = await response.json();
  if (!data?.data?.original_media_info?.main_url) throw new Error('No video URL in response');
  return data.data.original_media_info.main_url;
}

// ============================================================
//  方案B：/creativity/share/get_video_share_info
//  分享页 JS 源码确认的准确调用方式
// ============================================================

async function getVideoShareInfo(shareId, vid, creationId) {
  const response = await fetch(`${DOUBAO_ORIGIN}/creativity/share/get_video_share_info`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Origin': DOUBAO_ORIGIN, 'Referer': DOUBAO_ORIGIN + '/',
    },
    body: JSON.stringify({ share_id: shareId, vid, creation_id: creationId || '' }),
  });
  if (!response.ok) throw new Error('Share API HTTP ' + response.status);
  const data = await response.json();
  if (data?.data?.play_info?.main) return data.data.play_info.main;
  if (data?.data?.play_info?.backup) return data.data.play_info.backup;
  throw new Error('No video in share response');
}

// ============================================================
//  工具函数
// ============================================================

function extractQueryParam(url, param) {
  try { return new URL(url).searchParams.get(param); } catch { return null; }
}

async function fetchPageHtml(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml', 'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'Referer': DOUBAO_ORIGIN + '/',
    },
    redirect: 'follow',
  });
  if (!response.ok) return null;
  const buf = Buffer.from(await response.arrayBuffer());
  if (buf[0] === 0x1f && buf[1] === 0x8b) {
    try { const { gunzipSync } = await import('zlib'); return gunzipSync(buf).toString('utf-8'); }
    catch { return buf.toString('utf-8'); }
  }
  return buf.toString('utf-8');
}
