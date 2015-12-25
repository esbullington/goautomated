var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var sourcemaps  = require('gulp-sourcemaps');
var prefix      = require('gulp-autoprefixer');
var gutil				= require('gulp-util');
var chmod				= require('gulp-chmod');
var imagemin		= require('gulp-imagemin');
var imagemin		= require('gulp-imagemin');
var pngquant		= require('imagemin-pngquant');
var imageResize = require('gulp-image-resize');
var jpgCompress = require('imagemin-jpeg-recompress');
var minifyCss   = require('gulp-minify-css');
var rev 				= require('gulp-rev');
var revReplace  = require("gulp-rev-replace");
var fs 					= require('fs');
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
  return del(['assets/*', '_site/*']);
});

gulp.task('vendor', () => {
  return gulp.src(['src/scripts/vendor/**/*.js'])
    .pipe(gulp.dest(paths.dest + '/js/vendor'));
});

gulp.task('fonts', () => {
  return gulp.src([paths.src + '/fonts/**/*'])
		.pipe(gulp.dest(paths.dest + '/fonts'));
});

gulp.task('icons', () => {
  return gulp.src([paths.src + '/icons/**/*'])
		.pipe(gulp.dest(paths.dest + '/icons'));
});

/**
 * Compile js files using browserify
 */
gulp.task('scripts', function() {
  return browserify([paths.src + '/scripts/main.js'], {debug: true}).bundle()
    .on('error', scriptErrorHandler)
    .pipe(source('main.js'))
    .pipe(buffer())
		.pipe(gulp.dest('_site/assets/js'))
		.pipe(browserSync.reload({stream:true}))
		.pipe(gulp.dest('assets/js'));
});

/**
 * Compile js files using browserify
 */
gulp.task('scripts:build', function() {
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
	.pipe(sourcemaps.init())
	.pipe(sass().on('error', styleErrorHandler))
	.pipe(prefix(['last 15 versions', '> 1%', 'ie 8'], { cascade: true }))
	.pipe(sourcemaps.write())
	.pipe(gulp.dest('_site/assets/css'))
	.pipe(browserSync.reload({stream:true}))
	.pipe(gulp.dest('assets/css'));
});

gulp.task('sass:build', function () {
	return gulp.src(paths.src + '/styles/[^_]*.scss')
	.pipe(sass().on('error', styleErrorHandler))
	.pipe(prefix(['last 15 versions', '> 1%', 'ie 8'], { cascade: true }))
	.pipe(minifyCss({compatibility: 'ie8'}))
	.pipe(gulp.dest('_site/assets/css'))
	.pipe(gulp.dest('assets/css'));
});

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll:build', ['fonts', 'icons', 'images', 'srcset', 'sass:build', 'scripts:build', 'vendor'], function (done) {
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
  return gulp.src(['**/*', '!raw/**/*', '!backgrounds/**/*'], { cwd: paths.src + '/images' } )
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(chmod(664))
    .pipe(gulp.dest('_site/' + paths.dest + '/img'))
		.pipe(browserSync.reload({stream: true}))
    .pipe(gulp.dest(paths.dest + '/img'));
});

// Theme header background images
gulp.task('srcset', (cb) => {
  // create an array of image groups (see comments above)
  // specifying the folder name, the ouput dimensions and
  // whether or not to crop the images
  const images = [
      { dir: 'default', width: 1920, height: 1800, crop: false, filter: 'Catrom' },
      { dir: 'retina', width: 2880, height: 1800, crop: false, filter: 'Catrom' },
      { dir: 'thumbnail', width: 260, crop: false, filter: 'Catrom' }
  ];
  images.forEach( (type, i) => {
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
    .src(paths.src+'/images/backgrounds/*')
    .pipe(imageResize(resize_settings))
    .pipe(imagemin({
        progressive: true,
        // set this if you are using svg images
        svgoPlugins: [{removeViewBox: false}],
				use: [jpgCompress({progressive: false, target: 0.8, loops: 3, quality: 'medium'})]
        // use: [pngquant()]
    }))
    .pipe(chmod(664))
    .pipe(gulp.dest('_site/' + paths.dest+'/img/backgrounds/'+type.dir))
		.pipe(browserSync.reload({stream: true}))
    .pipe(gulp.dest(paths.dest+'/img/backgrounds/'+type.dir))
		.on('end', function() {
			if (i === 0) {
				cb();
			}
		});
  });
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['vendor', 'fonts', 'icons', 'sass', 'scripts', 'images', 'srcset', 'jekyll:rebuild'], function() {
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
	gulp.watch(paths.src + '/images/*', ['images']);
	gulp.watch(paths.src + '/images/backgrounds/*', ['srcset']);
	gulp.watch(paths.src + '/styles/**/*.scss', ['sass']);
	gulp.watch(paths.src + '/scripts/**/*.js', ['scripts']);
	gulp.watch(['*.{md,html}', 'blog/**/*', '_data/**/*', '_layouts/**/*.html', '_includes/**/*.{html,md}', '_posts/**/*.{html,md}', '_pages/**/*.{html,md}'], ['jekyll:rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site.
 */
gulp.task('build:prep', ['clean'], function(cb) {
  runSequence = require('run-sequence').use(gulp);
  runSequence('jekyll:build', cb);
});

gulp.task('build', ['revreplace']);

gulp.task("revision", ['build:prep'], function(){
  return gulp.src(["_site/assets/fonts/**/*", "_site/assets/css/**/*.css", "_site/assets/js/**/*.js", "_site/assets/img/**/*", "_site/assets/icons/**/*"], {base: "_site"})
    .pipe(rev())
    .pipe(gulp.dest("_site/"))
		.pipe(rmOrig())
    .pipe(rev.manifest())
    .pipe(gulp.dest("assets/"))
})

gulp.task("revreplace", ["revision"], function(){
  var manifest = gulp.src("assets/rev-manifest.json");
  return gulp.src(["_site/**/*.html", "_site/assets/css/*.css"], {base: "_site"})
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest("_site/"));
});
gulp.task('default', ['build']);
