const { src, dest, watch, parallel, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const sourcemaps = require('gulp-sourcemaps');
const cleanCSS = require('gulp-clean-css');
const htmlmin = require('gulp-htmlmin');
const fileInclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const obfuscator = require('gulp-javascript-obfuscator');

// SCSS → CSS
function styles() {
  return src('src/scss/**/*', { allowEmpty: true })
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([autoprefixer()]))
    .pipe(cleanCSS({ compatibility: 'ie8' }))
    .pipe(sourcemaps.write('.'))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream());
}

// HTML 파셜 & minify
function pages() {
  return src('src/**/*.html')
    .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

// JS 복사 및 난독화
function scripts() {
  return src('src/js/**/*.js')
    //.pipe(obfuscator({ compact: true })) //난독화 빌드
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream());
}

// data 파일
function data() {
  return src('src/data/**/*',{ allowEmpty: true })
    .pipe(dest('dist/data'))
    .pipe(browserSync.stream());
}

// 이미지 복사
function images() {
  return src('src/images/**/*', {encoding: false})
    .pipe(dest('dist/images'))
    .pipe(browserSync.stream());
}

// 동영상 복사
function videos() {
  return src('src/videos/**/*', {encoding: false})
    .pipe(dest('dist/videos'))
    .pipe(browserSync.stream());
}

// 폰트 복사
function fonts() {
  return src('src/fonts/**/*', {encoding: false})
    .pipe(dest('dist/fonts'))
    .pipe(browserSync.stream());
}

// 키오스크 콘텐츠 복사
function zcommonfiles() {
  return src('src/commonfiles/**/*', {encoding: false})
    .pipe(dest('dist/commonfiles'))
    .pipe(browserSync.stream());
}

// xml 복사
function xml() {
  return src('src/xml/**/*', {encoding: false})
    .pipe(dest('dist/xml'))
    .pipe(browserSync.stream());
}

// 개발 서버 + 감시
function serve() {
  browserSync.init({ server: 'dist' });
  watch('src/scss/**/*', styles);
  watch('src/**/*.html', pages);
  watch('src/js/**/*.js', scripts);
  watch('src/images/**/*', images);
  watch('src/videos/**/*', videos);
  watch('src/commonfiles/**/*', zcommonfiles);
  watch('src/xml/**/*', xml);
  watch('src/data/**/*', data);
}

exports.styles  = styles;
exports.pages   = pages;
exports.scripts = scripts;
exports.images  = images;
exports.fonts  = fonts;
exports.xml  = xml;
exports.zcommonfiles  = zcommonfiles;
exports.data  = data;
exports.default = series(
  parallel(styles, pages, scripts, videos, images, fonts, xml, zcommonfiles, data),
  serve
);
