/**
 * WatermarkLess - 视频代理 API
 * 
 * 解决字节跳动 CDN 对跨域 Origin 返回 403 的问题。
 * 支持 Range 请求，保证视频可播放和可拖动进度条。
 * 
 * GET /api/proxy?url=<urlencode(video_url)>
 * Response: video/mp4 binary with CORS headers
 */

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Content-Length, Content-Range, Accept-Ranges');
  res.setHeader('Accept-Ranges', 'bytes');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: '仅支持 GET 请求' });
  }

  const videoUrl = req.query.url;
  if (!videoUrl) {
    return res.status(400).json({ error: '缺少 url 参数' });
  }

  try {
    // 构造上游请求头
    const upstreamHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };

    // 支持 Range 请求（浏览器需要它来获取视频元数据和拖动进度条）
    const rangeHeader = req.headers['range'];
    if (rangeHeader) {
      upstreamHeaders['Range'] = rangeHeader;
    }

    const response = await fetch(videoUrl, { headers: upstreamHeaders });

    if (!response.ok && response.status !== 206) {
      return res.status(502).json({ error: `视频源返回 ${response.status}` });
    }

    // 透传关键响应头
    const contentType = response.headers.get('content-type') || 'video/mp4';
    const contentLength = response.headers.get('content-length');
    const contentRange = response.headers.get('content-range');

    res.setHeader('Content-Type', contentType);
    if (contentLength) res.setHeader('Content-Length', contentLength);
    if (contentRange) res.setHeader('Content-Range', contentRange);
    res.setHeader('Content-Disposition', 'inline');

    // 返回对应的状态码（206 表示部分内容）
    const statusCode = response.status === 206 ? 206 : 200;

    // 流式传输响应
    const buffer = await response.arrayBuffer();
    res.status(statusCode).send(Buffer.from(buffer));

  } catch (err) {
    console.error('代理异常:', err);
    return res.status(500).json({ error: `代理失败: ${err.message}` });
  }
}
