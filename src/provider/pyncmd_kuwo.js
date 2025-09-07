const select = require('./select');
const request = require('../request');
const { getManagedCacheStorage } = require('../cache');

const search = (info) => {
    const keyword = encodeURIComponent(info.keyword.replace(' - ', ' '));
    const searchUrl = `https://music-api.gdstudio.xyz/api.php?types=search&source=kuwo&name=${keyword}&count=1&pages=1`;
    
    return request('GET', searchUrl)
        .then(response => response.json())
        .then(data => {
            if (!Array.isArray(data) || data.length === 0) {
                return Promise.reject(new Error('No search results'));
            }
            // 更新info对象中的id
            return { ...info, id: data[0].id };
        });
};

const track = (info) => {
    const url = `https://music-api.gdstudio.xyz/api.php?types=url&source=kuwo&id=${info.id}&br=${
        ['999', '320'].slice(
            select.ENABLE_FLAC ? 0 : 1,
            select.ENABLE_FLAC ? 1 : 2
        )
    }`;
    
    return request('GET', url)
        .then(response => response.json())
        .then(jsonBody => {
            if (!jsonBody?.url) return Promise.reject();
            return jsonBody.br > 0 ? jsonBody.url : Promise.reject();
        });
};

const cs = getManagedCacheStorage('provider/pyncmd');
const check = (info) => cs.cache(info, () => search(info)).then(track);

module.exports = { check };
