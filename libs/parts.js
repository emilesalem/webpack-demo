const webpack = require('webpack');

const CleanWebpackPlugin = require('clean-webpack-plugin');

const ExtractTextPlugin = require('extract-text-webpack-plugin');

const PurifyCSSPlugin = require('purifycss-webpack-plugin');

exports.devServer = function(options) {
	return {

		devServer: {
										// Enable history API fallback so HTML5 History API based
			historyApiFallback: true,	// routing works. This is a good default that will come
										// in handy in more complicated setups.


			hot: true,					// Unlike the cli flag, this doesn't set
										// HotModuleReplacementPlugin!
			inline: true,


			stats: 'errors-only',		// Display only errors to reduce the amount of output.

			// Parse host and port from env to allow customization.
			//
			// If you use Vagrant or Cloud9, set
			// host: options.host || '0.0.0.0';
			//
			// 0.0.0.0 is available to all network devices
			// unlike default `localhost`.
			host: options.host, // Defaults to `localhost`
			port: options.port // Defaults to 8080
		},
		plugins: [
			new webpack.HotModuleReplacementPlugin({
				multiStep: true			// Enable multi-pass compilation for enhanced performance
										// in larger projects. Good default.
			})
		]
	};
}

exports.extractCSS = function(paths) {
	return {
		module: {
			loaders: [
				// Extract CSS during build
				{
					test: /\.css$/,
					loader: ExtractTextPlugin.extract('style', 'css'),
					include: paths
				}
			]
		},
		plugins: [
			// Output extracted CSS to a file
			new ExtractTextPlugin('[name].[chunkhash].css')
		]
	};
}
/*
exports.setupCSS = function(paths) {
	return {
		module: {
			loaders: [
				{
					test: /\.css$/,
					loaders: [
						'style',
						'css'
					],
					include: paths //If include isn’t set, Webpack will traverse all files within the base directory. This can hurt performance!
				}
			]
		}
	};
}
*/

exports.minify = function() {
	return {
		plugins: [
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					warnings: false
				}
			})
		]
	};
}

exports.extractBundle = function(options) {
	const entry = {};
	entry[options.name] = options.entries;

	return {
		// Define an entry point needed for splitting.
		entry: entry,
		plugins: [
			// Extract bundle and manifest files.
			// Manifest is needed for reliable caching.
			//“ It contains the Webpack runtime that starts the whole application and contains the dependency information needed by it”
			/*" If we don’t extract a manifest, Webpack will generate the runtime to the vendor bundle.
				In case we modify the application code, the application bundle hash will change.
				Because that hash will change, so does the implementation of the runtime as it uses the hash to load the application bundle.
				Due to this the vendor bundle will receive a new hash too! This is why you should keep the manifest separate from the main bundles as doing this avoids the problem."*/
			new webpack.optimize.CommonsChunkPlugin({
				names: [options.name, 'manifest']
			})
		]
	};
}

exports.clean = function(path) {
	return {
		plugins: [
			new CleanWebpackPlugin([path], {
				// Without `root` CleanWebpackPlugin won't point to our
				// project and will fail to work.
				root: process.cwd()
			})
		]
	};
}

exports.purifyCSS = function(paths) {
	return {
		plugins: [
			new PurifyCSSPlugin( {
				basePath: process.cwd(), // `paths` is used to point PurifyCSS to files not
				// visible to Webpack. You can pass glob patterns
				// to it.
				paths: paths
			} ),
		]
	}
}
