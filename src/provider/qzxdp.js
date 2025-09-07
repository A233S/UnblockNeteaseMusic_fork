const util = require('util');
const select = require('./select');
const request = require('../request');
const { getManagedCacheStorage } = require('../cache');

const track = (info) => {
	const apiUrl = 'https://tools.qzxdp.cn/api/wyy_vip/parse';
	const targetUrl = `https://music.163.com/#/song?id=${info.id}&musicType=lossless`;
	console.log(targetUrl);
	
	return request('POST', apiUrl, {
		"headers": {
		  "accept": "application/json, text/javascript, */*; q=0.01",
		  "accept-language": "zh-CN,zh;q=0.9,en;q=0.8",
		  "cache-control": "no-cache",
		  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
		  "pragma": "no-cache",
		  "priority": "u=1, i",
		  "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Google Chrome\";v=\"128\"",
		  "sec-ch-ua-mobile": "?0",
		  "sec-ch-ua-platform": "\"Windows\"",
		  "sec-fetch-dest": "empty",
		  "sec-fetch-mode": "cors",
		  "sec-fetch-site": "same-origin",
		  "x-requested-with": "XMLHttpRequest",
		  "cookie": "__gads=ID=ff436b87de5bf6c0:T=1747848200:RT=1747848200:S=ALNI_MZ2FsvktEWrcdwhbSP9xr20G4y-Tg; __eoi=ID=6fa59cd04e8b71ff:T=1747848200:RT=1747848200:S=AA-AfjaHt8NfABRt6mCksneltsNB; PHPSESSID=9d4cc575bef2f0a74c17297fc6238015",
		  "Referer": "https://tools.qzxdp.cn/wyy_vip",
		  "Referrer-Policy": "strict-origin-when-cross-origin"
		},
		body: `url=${encodeURIComponent(targetUrl)}`
	})
		.then((response) => response.json())
		.then((jsonBody) => {
			console.log(response);
			if (jsonBody.status === 'ok' && jsonBody.data?.url) {
				return jsonBody.data.url;
			}
			return Promise.reject();
		});
};

const cs = getManagedCacheStorage('provider/pyncmd');
const check = (info) => cs.cache(info, () => track(info));

module.exports = { check };
