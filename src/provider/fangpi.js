const select = require('./select');
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
    // 通过分析HTML，我们发现每个搜索结果都在一个 class 为 "music-link" 的 <a> 标签中。
    // 我们可以使用 CSS 选择器 '.card-text a.music-link' 来精确定位这些链接。
    $('.card-text a.music-link').each((index, element) => {
      // 获取 href 属性值，例如 "/music/11575730"
      const partialUrl = $(element).attr('href');

      // 确保 partialUrl 存在且是有效的
      if (partialUrl && partialUrl.startsWith('/music/')) {
        // 5. 拼接成完整的 URL
        const fullUrl = `${baseUrl}${partialUrl}`;
        resultUrls.push(fullUrl);
      }
    });

    // 6. 返回结果数组
    return resultUrls;

  } catch (error) {
    console.error(`请求或解析时发生错误: ${error.message}`);
    // 如果发生错误，返回一个空数组
    return [];
  }
}

/**
 * 从 fangpi.net 获取音乐的 play_id
 * @param {string | number} url_id 音乐的 URL ID
 * @returns {Promise<string|null>} 返回 play_id 字符串，如果失败则返回 null
 */
async function getPlayId(url_id) {
  // 1. 校验输入参数
  if (!url_id) {
    console.error('错误：必须提供 url_id。');
    return null;
  }

  const url = `${url_id}`;
  console.log(`正在请求: ${url}`);

  try {
    // 2. 发送 GET 请求获取 HTML 内容
    const response = await fetch(url, {
      // 添加一些常见的浏览器头信息，防止被服务器拒绝
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // 检查请求是否成功
    if (!response.ok) {
      console.error(`HTTP 错误! 状态码: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // 3. 使用 cheerio 加载 HTML
    const $ = cheerio.load(html);

    let appDataString = null;

    // 4. 遍历所有 script 标签，找到包含 "window.appData" 的那个
    $('script').each((index, element) => {
      const scriptContent = $(element).html();
      if (scriptContent && scriptContent.includes('window.appData')) {
        // 5. 使用正则表达式从脚本内容中提取 JSON 对象字符串
        const match = scriptContent.match(/window\.appData\s*=\s*({.*});/);
        if (match && match[1]) {
          appDataString = match[1];
          return false; // 找到后停止遍历
        }
      }
    });

    if (!appDataString) {
      console.error('在页面中未找到 "window.appData" 数据。');
      return null;
    }

    // 6. 解析 JSON 字符串并提取 play_id
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

const track = (info) => {
	const apiUrl = 'https://www.fangpi.net/api/play-url';
	const keyword = encodeURIComponent(info.keyword.replace(' - ', ' '));
	
	//搜索
	const targeturls = await searchFangpi(keyword);
	if (urls.length > 0) {
      // 如果有结果，获取第一个 (urls[0])
      const targetUrl_on = urls[0];
    } else {
      // 如果没有结果，给出提示
      Promise.reject(`没有为关键词 "${keyword}" 找到任何结果。`);
    }
    
    // 获取targetUrlID
    const targetUrlID = await getPlayId(targetUrl_on);
	
	return request('POST', apiUrl, {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `id=${encodeURIComponent(targetUrlID)}`
	})
		.then((response) => response.json())
		.then((jsonBody) => {
			if (jsonBody.status === 'ok' && jsonBody.data?.url) {
				return jsonBody.data.url;
			}
			return Promise.reject();
		});
};

const cs = getManagedCacheStorage('provider/pyncmd');
const check = (info) => cs.cache(info, () => track(info));

module.exports = { check };
