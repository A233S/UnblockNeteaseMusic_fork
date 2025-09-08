const request = require('../request');
const { getManagedCacheStorage } = require('../cache');
const axios = require('axios');
const cheerio = require('cheerio');

/**
 * 在 fangpi.net 网站上搜索歌曲，并返回搜索结果的URL列表。
 * @param {string} keyword - 要搜索的歌曲关键词。
 * @returns {Promise<string[]>} - 一个包含所有匹配歌曲的完整URL的数组。
 */
async function searchFangpi(keyword) {
  // 网站的基础 URL
  const baseUrl = 'https://www.fangpi.net';
  
  // 对关键词进行 URL 编码，以处理空格或特殊字符
  const encodedKeyword = encodeURIComponent(keyword);
  
  // 构造完整的搜索 URL
  const searchUrl = `${baseUrl}/s/${encodedKeyword}`;

  console.log(`正在请求: ${searchUrl}`);

  try {
    // 1. 发送 GET 请求获取 HTML 页面内容
    const response = await axios.get(searchUrl, {
      // 添加一些常见的请求头，模拟浏览器访问，防止被屏蔽
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7',
      }
    });
    const html = response.data;

    // 2. 使用 cheerio 加载 HTML
    const $ = cheerio.load(html);

    // 3. 创建一个数组来存放结果
    const resultUrls = [];

    // 4. 定位元素并提取数据
    $('.card-text a.music-link').each((index, element) => {
      const partialUrl = $(element).attr('href');
      if (partialUrl && partialUrl.startsWith('/music/')) {
        const fullUrl = `${baseUrl}${partialUrl}`;
        resultUrls.push(fullUrl);
      }
    });

    // 6. 返回结果数组
    return resultUrls;

  } catch (error) {
    console.error(`请求或解析时发生错误: ${error.message}`);
    return [];
  }
}

/**
 * 从 fangpi.net 获取音乐的 play_id
 * @param {string} songUrl 音乐的完整 URL
 * @returns {Promise<string|null>} 返回 play_id 字符串，如果失败则返回 null
 */
async function getPlayId(songUrl) {
  if (!songUrl) {
    console.error('错误：必须提供 songUrl。');
    return null;
  }

  console.log(`正在请求: ${songUrl}`);

  try {
    const response = await axios.get(songUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);
    let appDataString = null;

    $('script').each((index, element) => {
      const scriptContent = $(element).html();
      if (scriptContent && scriptContent.includes('window.appData')) {
        const match = scriptContent.match(/window\.appData\s*=\s*({.*});/);
        if (match && match[1]) {
          appDataString = match[1];
          return false; 
        }
      }
    });

    if (!appDataString) {
      console.error('在页面中未找到 "window.appData" 数据。');
      return null;
    }

    const appData = JSON.parse(appDataString);
    const playId = appData.play_id;

    if (!playId) {
      console.error('在 "appData" 对象中未找到 "play_id"。');
      return null;
    }

    return playId;

  } catch (error) {
    console.error('执行过程中发生错误:', error.message);
    return null;
  }
}

const track = async (info) => {
  const apiUrl = 'https://www.fangpi.net/api/play-url';
  const keyword = info.keyword.replace(' - ', ' ');
  
  try {
    // 搜索
    const targetUrls = await searchFangpi(keyword);

    // 检查搜索结果是否为空
    if (targetUrls.length === 0) {
      throw new Error(`没有为关键词 "${keyword}" 找到任何结果。`);
    }
    
    const firstResultUrl = targetUrls[0];
    
    // 获取 play_id
    const playId = await getPlayId(firstResultUrl);
    
    // 检查 playId 是否成功获取
    if (!playId) {
      throw new Error(`无法从URL: ${firstResultUrl} 获取 play_id。`);
    }
    
    // 发送API请求获取播放URL
    const response = await request('POST', apiUrl, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `id=${encodeURIComponent(playId)}`
    });
    
    const jsonBody = await response.json();

    if (jsonBody.status === 'ok' && jsonBody.data?.url) {
      return jsonBody.data.url;
    } else {
      throw new Error('API未能返回有效的播放URL。');
    }
  } catch (error) {
    console.error(`获取音轨失败: ${error.message}`);
    throw error;
  }
};

const cs = getManagedCacheStorage('provider/pyncmd');
const check = (info) => cs.cache(info, () => track(info));

module.exports = { check };
