const gulp = require('gulp');
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const cleanDest = require('gulp-clean-dest');
const minifyjs = require('gulp-minify');
const minifyHtml = require('gulp-htmlmin');
const concat = require('gulp-concat');
const imageminMozjpeg = require('imagemin-mozjpeg');
const sass = require('gulp-sass');

gulp.task('convert-and-copy-css', function () {
	gulp.src('css/**')
		.pipe(cleanDest('dist/css'))
		.pipe(sass({
			outputStyle: 'compressed'
		}).on('error', sass.logError))
		.pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
		.pipe(gulp.dest('dist/css'));
});

gulp.task('bundle-and-copy-index-scripts', function () {
	gulp.src(['js/dbhelper.js','js/main.js'])
		.pipe(cleanDest('dist/js/'))
		.pipe(concat('index.js'))
		.pipe(minifyjs({ noSource: true }))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('copy-worker', function () {
	gulp.src('js/worker.js')
		.pipe(minifyjs({ noSource: true }))
		.pipe(gulp.dest('dist/js'));
});

gulp.task('bundle-and-copy-restaurant-scripts', function () {
	gulp.src(['js/dbhelper.js','js/restaurant_info.js'])
	.pipe(concat('restaurant.js'))	
	.pipe(minifyjs({ noSource: true }))
	.pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', function () {
	gulp.src('./*.html')
		.pipe(minifyHtml({ collapseWhitespace: true }))
		.pipe(gulp.dest('./dist'));
});

gulp.task('copy-manifest',function(){
 gulp.src('./manifest.json').pipe(gulp.dest('./dist'));
});
gulp.task('copy-libraries', function () {
	gulp.src(['./node_modules/idb/lib/idb.js',
		'./newservice.js'])
		.pipe(minifyjs({ noSource: true }))
		.pipe(gulp.dest('./dist'));
});
gulp.task('copy-images', function () {
	gulp.src('img/*')
		.pipe(imagemin([imageminMozjpeg({
			quality: 20,
		})],{verbose:true}))
		.pipe(gulp.dest('dist/img'))
});


gulp.task('default', ['copy-html', 'copy-images', 'copy-libraries', 'convert-and-copy-css', 'bundle-and-copy-index-scripts','bundle-and-copy-restaurant-scripts','copy-manifest'
,'copy-worker'
], function () {
	
});

gulp.task('build', [
	'copy-html',
	'copy-images',
	'copy-libraries', 
	'convert-and-copy-css',
	'bundle-and-copy-index-scripts',
	'bundle-and-copy-restaurant-scripts',
	'copy-manifest',
	'copy-worker'
]);
