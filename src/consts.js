const DEFAULT_SOURCE = ['pyncmd', 'toubiec', 'pyncmd_kuwo', 'kugou', 'pyncmd_joox', 'migu'];
const PROVIDERS = {
	qq: require('./provider/qq'),
	kugou: require('./provider/kugou'),
	kuwo: require('./provider/kuwo'),
	migu: require('./provider/migu'),
	joox: require('./provider/joox'),
	youtube: require('./provider/youtube'),
	youtubedl: require('./provider/youtube-dl'),
	ytdlp: require('./provider/yt-dlp'),
	bilibili: require('./provider/bilibili'),
	bilivideo: require('./provider/bilivideo'),
	pyncmd: require('./provider/pyncmd'),
	pyncmd_kuwo: require('./provider/pyncmd_kuwo'),
	qzxdp: require('./provider/qzxdp'),
	toubiec: require('./provider/toubiec'),
	pyncmd_joox: require('./provider/pyncmd_joox'),
	//fangpi: require('./provider/fangpi'),
};

module.exports = {
	DEFAULT_SOURCE,
	PROVIDERS,
};
