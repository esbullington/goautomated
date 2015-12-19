var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var gutil				= require('gulp-util');
var chmod				= require('gulp-chmod');
var imagemin		= require('gulp-imagemin');
var rev 				= require('gulp-rev');
var browserify 	= require('browserify');
var uglify 			= require('gulp-uglify');
var buffer 			= require('vinyl-buffer');
var through 		= require('through2');
var source	 		= require('vinyl-source-stream');
var del			 		= require('del');
var cp          = require('child_process');

var messages = {
	jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

var paths = {
	dest: 'assets',
	src: 'src'
};

// Error message handler
function printError(err){
  // Log to console/browsersync
	browserSync.notify(err.messageFormatted);
  var displayErr = gutil.colors.red(err);
  gutil.log(displayErr);
}

// Handler for sass
function styleErrorHandler(err){
  var message = new gutil.PluginError('styles', err.messageFormatted).toString();
  printError(message);
  this.emit('end');
}

// Handler for browserify
function scriptErrorHandler(err){
  var message = new gutil.PluginError('scripts', err.message).toString();
  printError(message);
  this.emit('end');
}

function rmOrig() {
  return through.obj(function(file, enc, cb) {
    var self = this;
    if (!file.revOrigPath) {
      return cb();
    }
    gutil.log(gutil.colors.red('DELETING'), file.revOrigPath);
    fs.unlink(file.revOrigPath, function(err) {
			if (err) {
				gutil.log(gutil.colors.red('ERROR'), err);
			}
      self.push(file);
      cb();
    });
  });
};

gulp.task('clean', function() {
  return del(['_site/*']);
});

/**
 * Compile js files using browserify
 */
gulp.task('scripts', function() {
  return browserify([paths.src + '/scripts/main.js']).bundle()
    .on('error', scriptErrorHandler)
    .pipe(source('main.js'))
    .pipe(buffer())
    .pipe(uglify())
    // .pipe(rename('main.js'))
		.pipe(gulp.dest('_site/assets/js'))
		.pipe(browserSync.reload({stream:true}))
		.pipe(gulp.dest('assets/js'));
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
	return gulp.src(paths.src + '/styles/[^_]*.scss')
	.pipe(sass().on('error', styleErrorHandler))
	.pipe(prefix(['last 15 versions', '> 1%', 'ie 8'], { cascade: true }))
	.pipe(gulp.dest('_site/assets/css'))
	.pipe(browserSync.reload({stream:true}))
	.pipe(gulp.dest('assets/css'));
});

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll:build', ['sass', 'scripts'], function (done) {
	browserSync.notify(messages.jekyllBuild);
	cp.spawn('bundle', ['exec', 'jekyll', 'build', '--config', '_config.yml,config/_config_production.yml'], {stdio: 'inherit'})
	.on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll:rebuild', function (done) {
	browserSync.notify(messages.jekyllBuild);
	cp.spawn('bundle', ['exec', 'jekyll', 'build'], {stdio: 'inherit'})
	.on('close', function() {
		browserSync.reload();
		done();
	});
});

gulp.task('images', () => {
  return gulp.src([paths.src + 'images/*', '!' + paths.src + 'images/raw', '!' + paths.src + 'images/backgrounds'], {base: paths.src + 'images' })
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(chmod(664))
    .pipe(gulp.dest(paths.dest + 'images'));
});

// Theme header background images
gulp.task('srcset', (cb) => {
  // create an array of image groups (see comments above)
  // specifying the folder name, the ouput dimensions and
  // whether or not to crop the images
  const images = [
      { dir: 'default', width: 2880, height: 1800, crop: true },
      { dir: 'thumbnail', width: 260, crop: false, filter: 'Catrom' }
  ];
  images.forEach( (type) => {
    var resize_settings = {
      width: type.width,
      crop: type.crop,
      upscale : false
    }
    for (key in type) {
      if (type.hasOwnProperty(key)) {
          resize_settings[key] = type[key];
      }
    }
    gulp
    .src(paths.src+'images/backgrounds/*')
    .pipe(imageresize(resize_settings))
    .pipe(imagemin({
        progressive: true,
        // set this if you are using svg images
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(chmod(664))
    .pipe(gulp.dest(paths.dest+'images/backgrounds/'+type.dir));
  });
  cb();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'scripts', 'jekyll:rebuild'], function() {
	browserSync({
		host: "eric-desktop.home.lan",
		server: {
			baseDir: '_site'
		}
	});
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', ['browser-sync'], function () {
	gulp.watch(paths.src + '/styles/**/*.scss', ['sass']);
	gulp.watch(paths.src + '/scripts/**/*.js', ['scripts']);
	gulp.watch(['*.{md,html}', '_themes/**/*', 'blog/**/*', '_data/**/*', '_layouts/**/*.html', '_includes/**/*.{html,md}', '_posts/**/*.{html,md}', '_pages/**/*.{html,md}'], ['jekyll:rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site.
 */
gulp.task('build:prep', ['clean'], function(cb) {
  runSequence = require('run-sequence').use(gulp);
  runSequence('jekyll:build', cb);
});
gulp.task('build', ['build:prep'], 
  () => {
    return gulp.src([paths.dest + 'styles/*.css', paths.dest + 'scripts/**/*.js'], {base: paths.dest})
      .pipe(rev())
      .pipe(gulp.dest(paths.dest))  // write rev'd assets to build dir
      .pipe(rmOrig())
      .pipe(rev.manifest())
      .pipe(gulp.dest(paths.dest)); // write manifest to build dir
});
gulp.task('default', ['build']);
