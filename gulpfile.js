const gulp = require('gulp');
const gutil = require('gulp-util');
const liveserver = require('gulp-live-server');
const runSequence = require ('run-sequence');
const webpack = require('webpack');
const shell = require('gulp-shell');
const del = require('del');
const open = require('open');

const webpackConfig = require("./webpack.config.js");
const WebpackDevServer = require("webpack-dev-server");

// The development server (the recommended option for development)
gulp.task("default", ["dev"]);

gulp.task("dev", ["webpack-dev-server"]);

// Build and watch cycle (another option for development)
// Advantage: No server required, can run app from filesystem
// Disadvantage: Requests are not blocked until bundle is available,
//               can serve an old app on refresh
gulp.task("build-dev", ["webpack:build-dev"], function() {
	gulp.watch(["src/**/*.ts","src/**/*.html"], ["webpack:build-dev"]);
});

// Production build
gulp.task("build", ["webpack:build"]);

gulp.task("webpack:build", [ 'clean'], function(callback) {
	// modify some webpack config options
	var config = Object.create(webpackConfig);
	config.plugins = config.plugins.concat(
		new webpack.DefinePlugin({
			"process.env": {
				// This has effect on the react lib size
				"NODE_ENV": JSON.stringify("production")
			}
		})
	);

	// run webpack
	webpack(config, function(err, stats) {
		if(err) throw new gutil.PluginError("webpack:build", err);
		gutil.log("[webpack:build]", stats.toString({
			colors: true
		}));
		callback();
	});
});

gulp.task("webpack:build-dev", ['clean'], function(callback) {
    // modify some webpack config options
    var config = Object.create(webpackConfig);
    config.devtool = "sourcemap";

    // create a single instance of the compiler to allow caching
    var devCompiler = webpack(config);

	// run webpack
	devCompiler.run(function(err, stats) {
		if(err) throw new gutil.PluginError("webpack:build-dev", err);
		gutil.log("[webpack:build-dev]", stats.toString({
			colors: true
		}));
		callback();
	});
});

gulp.task("webpack-dev-server", function(callback) {
	// modify some webpack config options
	var config = Object.create(webpackConfig);
	config.devtool = "sourcemap";

	// Start a webpack-dev-server
	new WebpackDevServer(webpack(config), {
		publicPath: config.output.publicPath,
        contentBase: __dirname + '/dist/',
        hot:true,
        inline: true,
		stats: {
			colors: true
		}
	}).listen(8080, "localhost", function(err) {
		var entryUrl = "http://localhost:8080/webpack-dev-server/index.html";
		if(err) throw new gutil.PluginError("webpack-dev-server", err);
		gutil.log("[webpack-dev-server]", entryUrl);
		
		console.log('Opening browser...');
  		open(entryUrl);
		
	});
});

gulp.task('clean', function() {
    return del([
        "dist/**"
    ]);
});

gulp.task('serve', shell.task('"node_modules/.bin/live-server" dist --entry-file="index.html"'));

