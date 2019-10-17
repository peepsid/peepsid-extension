require('dotenv').config();
const path = require('path');
const webpack = require('webpack')
const ZipPlugin = require('zip-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const rm = require('rimraf');

rm.sync('./dist')

const production = process.env.SCATTER_ENV === 'production';

const staticPlugins = [
	new Dotenv(),
	new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
	new webpack.HashedModuleIdsPlugin(),
];
const prodPlugins = staticPlugins.concat([
	new ZipPlugin({ path: '../', filename: 'scatter.zip' }),
])

const productionPlugins = !production ? staticPlugins : prodPlugins;

const replaceSuffixes = (file) => file.replace('scss', 'css');

const filesToPack = [
	'background.js',
	'wallet_content.js',
	'wallet_inject.js',
	'app_inject.js',
	'app_content.js',
];
const entry = filesToPack.reduce((o, file) => Object.assign(o, {[replaceSuffixes(file)]: `./src/${file}`}), {});

module.exports = {
	entry,
	output: {
		path: path.resolve(__dirname, './dist'),
		filename: '[name]',
		chunkFilename: '[name].bundle.js',
	},
	resolve: {
		extensions: ['.js', '.vue', '.json'],
		modules: [ path.join(__dirname, "node_modules") ]
	},

	optimization: {
		minimize: false,
	},

	// optimization: {
	// 	minimizer: [
	// 		new TerserPlugin({
	// 			cache: true,
	// 			parallel: true,
	// 			sourceMap: false, // Must be set to true if using source-maps in production
	// 			terserOptions: {
	// 				// https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
	// 				ecma: undefined,
	// 				warnings: false,
	// 				parse: {},
	// 				compress: {},
	// 				mangle: true, // Note `mangle.properties` is `false` by default.
	// 				module: false,
	// 				output: null,
	// 				toplevel: false,
	// 				nameCache: null,
	// 				ie8: false,
	// 				keep_classnames: undefined,
	// 				keep_fnames: false,
	// 				safari10: false,
	// 			}
	// 		})
	// 	],
	// 	namedModules: false,
	// 	namedChunks: false,
	// 	nodeEnv: 'production',
	// 	flagIncludedChunks: true,
	// 	occurrenceOrder: true,
	// 	sideEffects: true,
	// 	usedExports: true,
	// 	concatenateModules: true,
	// 	noEmitOnErrors: true,
	// 	checkWasmTypes: true,
	// 	minimize: true,
	// 	splitChunks: {
	// 		chunks: 'all',
	// 		cacheGroups: {
	// 			commons: {
	// 				test: /[\\/]node_modules[\\/]/,
	// 				name: 'vendor',
	// 				chunks: 'all',
	// 				// maxSize: 500000,
	// 			}
	// 		}
	// 	}
	// },



	module: {
		rules: []
	},
	plugins: [
		new CopyWebpackPlugin([`./static/`]),
		new CopyWebpackPlugin([`./html/`]),
	].concat(productionPlugins),
	stats: { colors: true },
	devtool: 'inline-source-map', //inline-
}
