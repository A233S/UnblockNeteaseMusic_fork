const TerserPlugin = require('terser-webpack-plugin');
const webpack = require('webpack');

module.exports = {
	target: 'node',
	mode: 'production',
	entry: {
		app: './src/app.js',
		bridge: './src/bridge.js',
	},
	output: {
		filename: '[name].js',
		path: __dirname + '/precompiled',
	},
	// 添加 externals 来排除 Node.js 内置模块
	externals: {
		'fs': 'commonjs fs',
		'path': 'commonjs path',
		'http': 'commonjs http',
		'https': 'commonjs https',
		'crypto': 'commonjs crypto',
		'stream': 'commonjs stream',
		'util': 'commonjs util',
		'url': 'commonjs url',
		'querystring': 'commonjs querystring',
		'os': 'commonjs os',
		'net': 'commonjs net',
		'tls': 'commonjs tls',
		'zlib': 'commonjs zlib',
		'events': 'commonjs events',
		'buffer': 'commonjs buffer',
		'child_process': 'commonjs child_process',
		'cluster': 'commonjs cluster',
		'dgram': 'commonjs dgram',
		'dns': 'commonjs dns',
		'readline': 'commonjs readline',
		'repl': 'commonjs repl',
		'tty': 'commonjs tty',
		'vm': 'commonjs vm',
		'worker_threads': 'commonjs worker_threads'
	},
	// 添加 resolve 配置
	resolve: {
		extensions: ['.js', '.json'],
		fallback: {
			// 禁用浏览器端的 polyfill
			"fs": false,
			"path": false,
			"crypto": false,
			"stream": false,
			"util": false,
			"url": false,
			"querystring": false,
			"http": false,
			"https": false,
			"os": false,
			"net": false,
			"tls": false,
			"zlib": false,
			"events": false,
			"buffer": false
		}
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					// Use `.swcrc` to configure swc
					loader: require.resolve('swc-loader'),
				},
			},
		],
	},
	plugins: [
		new webpack.BannerPlugin({
			banner: '#!/usr/bin/env node',
			raw: true,
		}),
		// 添加环境变量定义
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': JSON.stringify('production'),
			'global': 'global',
			'process': 'process'
		}),
		// 忽略一些可能导致问题的模块
		new webpack.IgnorePlugin({
			resourceRegExp: /^\.\/locale$/,
			contextRegExp: /moment$/
		})
	],
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				parallel: true,
				minify: TerserPlugin.swcMinify,
				terserOptions: {
					compress: {
						ecma: 2018,
						// 添加更多压缩选项
						drop_console: false, // 保留 console
						drop_debugger: true,
						pure_funcs: [], // 不移除任何函数调用
						keep_fargs: true, // 保留函数参数
						keep_fnames: true, // 保留函数名
					},
					mangle: {
						keep_fnames: true, // 保留函数名
						keep_classnames: true // 保留类名
					},
					format: {
						comments: false // 移除注释
					}
				},
			}),
		],
	},
	// 添加 node 配置
	node: {
		__dirname: false,
		__filename: false,
		global: false
	},
	// 添加性能配置
	performance: {
		hints: false
	}
};
