const gulp = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const del = require('del');

const path = {
  src: './src',
  build: './build',
  docs: './docs'
};

gulp.task('clean:dev', function() {
  return del([`${path.build}/**/*`]);
});

gulp.task('clean:docs', function() {
  return del([`${path.docs}/**/*`]);
});

gulp.task('html:dev', function() {
  return gulp
    .src([
      `${path.src}/html/**/*.html`,
      `!${path.src}/html/**/_*.html`
    ])
    .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
    .pipe(gulp.dest(path.build))
    .pipe(browserSync.stream());
});

gulp.task('html:docs', function() {
  return gulp
    .src([
      `${path.src}/html/**/*.html`,
      `!${path.src}/html/**/_*.html`
    ])
    .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
    .pipe(gulp.dest(path.docs));
});

gulp.task('sass:dev', function() {
  return gulp
    .src(`${path.src}/scss/**/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(sass({
      includePaths: ['node_modules'],
      quietDeps: true
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${path.build}/assets/css`))
    .pipe(browserSync.stream());
});

gulp.task('sass:docs', function() {
  return gulp
    .src(`${path.src}/scss/**/*.scss`)
    .pipe(sass({
      includePaths: ['node_modules'],
      quietDeps: true
    }).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(gulp.dest(`${path.docs}/assets/css`));
});

gulp.task('js:dev', function() {
  return gulp
    .src(`${path.src}/js/**/*.js`)
    .pipe(sourcemaps.init())
    .pipe(concat('main.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(`${path.build}/assets/js`))
    .pipe(browserSync.stream());
});

gulp.task('js:docs', function() {
  return gulp
    .src(`${path.src}/js/**/*.js`)
    .pipe(concat('main.js'))
    .pipe(uglify())
    .pipe(gulp.dest(`${path.docs}/assets/js`));
});

gulp.task('images:dev', function() {
  return gulp
    .src(`${path.src}/img/**/*.{jpg,jpeg,png,gif,svg,ico}`)
    .pipe(gulp.dest(`${path.build}/assets/img`));
});

gulp.task('images:docs', function() {
  return gulp
    .src(`${path.src}/img/**/*.{jpg,jpeg,png,gif,svg,ico}`)
    .pipe(imagemin([
      imagemin.mozjpeg({ quality: 80, progressive: true }),
      imagemin.optipng({ optimizationLevel: 2 }),
      imagemin.svgo({ plugins: [{ removeViewBox: false }] })
    ]))
    .pipe(gulp.dest(`${path.docs}/assets/img`));
});

gulp.task('video:dev', function() {
  return gulp
    .src(`${path.src}/video/**/*.{mp4,webm,ogg,avi,mov}`)
    .pipe(gulp.dest(`${path.build}/assets/video`));
});

gulp.task('video:docs', function() {
  return gulp
    .src(`${path.src}/video/**/*.{mp4,webm,ogg,avi,mov}`)
    .pipe(gulp.dest(`${path.docs}/assets/video`));
});

gulp.task('files:dev', function() {
  return gulp
    .src(`${path.src}/files/**/*`)
    .pipe(gulp.dest(`${path.build}/assets/files`));
});

gulp.task('files:docs', function() {
  return gulp
    .src(`${path.src}/files/**/*`)
    .pipe(gulp.dest(`${path.docs}/assets/files`));
});

gulp.task('server:dev', function(done) {
  browserSync.init({
    server: {
      baseDir: path.build,
      directory: false
    },
    notify: false,
    open: true,
    port: 3000
  });
  done();
});

gulp.task('server:docs', function(done) {
  browserSync.init({
    server: {
      baseDir: path.docs,
      directory: false
    },
    notify: false,
    open: true,
    port: 3001
  });
  done();
});

gulp.task('watch:dev', function(done) {
  gulp.watch(`${path.src}/html/**/*.html`, gulp.series('html:dev'));
  gulp.watch(`${path.src}/scss/**/*.scss`, gulp.series('sass:dev'));
  gulp.watch(`${path.src}/js/**/*.js`, gulp.series('js:dev'));
  gulp.watch(`${path.src}/img/**/*`, gulp.series('images:dev'));
  gulp.watch(`${path.src}/video/**/*`, gulp.series('video:dev'));
  gulp.watch(`${path.src}/files/**/*`, gulp.series('files:dev'));
  done();
});

gulp.task('default', gulp.series(
  'clean:dev',
  gulp.parallel('html:dev', 'sass:dev', 'js:dev', 'images:dev', 'video:dev', 'files:dev'),
  gulp.parallel('server:dev', 'watch:dev')
));

gulp.task('docs', gulp.series(
  'clean:docs',
  gulp.parallel('html:docs', 'sass:docs', 'js:docs', 'images:docs', 'video:docs', 'files:docs'),
  'server:docs'
));