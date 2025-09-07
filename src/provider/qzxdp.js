const select = require('./select');
const request = require('../request');
const { getManagedCacheStorage } = require('../cache');

const track = (info) => {
  const apiUrl = 'https://tools.qzxdp.cn/api/wyy_vip/parse';
  const targetUrl = `https://music.163.com/song?id=${info.id}`;

  return request('POST', apiUrl, {
    headers: {
      'accept': 'application/json, text/javascript, */*; q=0.01',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'cookie': 'PHPSESSID=9d4cc575bef2f0a74c17297fc6238015; Hm_lvt_db6d1ce83169ec92d86808a0f6a47c85=1757221445; HMACCOUNT=DA8863BD4178C6CD; Hm_lpvt_db6d1ce83169ec92d86808a0f6a47c85=1757221447; __gads=ID=ff436b87de5bf6c0:T=1747848200:RT=1757221448:S=ALNI_MZ2FsvktEWrcdwhbSP9xr20G4y-Tg; __eoi=ID=6fa59cd04e8b71ff:T=1747848200:RT=1757221448:S=AA-AfjaHt8NfABRt6mCksneltsNB; FCNEC=%5B%5B%22AKsRol_PgIhvc6Nsgjo0iM4TVYHgo6JIPm2DayCrM6ERSkP6UOx1B9Vh_WKMj5EoSoSGSqZkY_Os0EYFA14JXL49_p_-lCAqAKUxKYmUazI3B3PNtyk2oHEAxkRs3B6Ut6WxdTR1zM8LaKlSaayYeG-9U58sgqZ2ZA%3D%3D%22%5D%5D',
      'referer': 'https://tools.qzxdp.cn/wyy_vip',
      'x-requested-with': 'XMLHttpRequest'
    },
    body: `url=${encodeURIComponent(targetUrl)}&musicType=lossless`
  })
  .then((response) => response.json())
  .then((jsonBody) => {
    if (jsonBody?.status === 'ok' && jsonBody.data?.url) {
      return jsonBody.data.url;
    }
    return Promise.reject('API response error');
  });
};

const cs = getManagedCacheStorage('provider/pyncmd');
const check = (info) => cs.cache(info, () => track(info));

module.exports = { check };
