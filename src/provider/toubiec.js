const select = require('./select');
const request = require('../request');
const { getManagedCacheStorage } = require('../cache');

const track = (info) => {
	// Credit: This API is provided by GD studio (music.gdstudio.xyz).
	const url =
		'https://api.toubiec.cn/wyapi/getMusicUrl.php?id=' +
		info.id +
		'&level=' +
		['lossless', 'standard'].slice(
			select.ENABLE_FLAC ? 0 : 1,
			select.ENABLE_FLAC ? 1 : 2
		);
	return request('GET', url)
		.then((response) => response.json())
        .then((jsonBody) => {
            // 验证响应数据结构
            if (
                !jsonBody?.data || 
                !Array.isArray(jsonBody.data) || 
                jsonBody.data.length === 0 ||
                !jsonBody.data[0].url
            ) {
                return Promise.reject();
            }
            const trackData = jsonBody.data[0];
            return trackData.br > 0 ? trackData.url : Promise.reject();
        });
};

const cs = getManagedCacheStorage('provider/pyncmd');
const check = (info) => cs.cache(info, () => track(info));

module.exports = { check };
