const select = require('./select');
const request = require('../request');
const { getManagedCacheStorage } = require('../cache');

const track = (info) => {
	const apiUrl = 'https://tools.qzxdp.cn/api/wyy_vip/parse';
	const targetUrl = `https://music.163.com/#/song?id=${info.id}&musicType=lossless`;

	return request('POST', apiUrl, {
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: `url=${encodeURIComponent(targetUrl)}`,
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
