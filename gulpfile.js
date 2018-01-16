var gulp = require('gulp');
var webpack = require('webpack');
var sass = require('gulp-sass');
var argv = require('yargs').argv;
var gulpif = require('gulp-if');
var browserSync = require('browser-sync').create();

var dev = (process.env.NODE_ENV || 'development').trim() == 'development';

gulp.task('default', ['build']);

var remote = true;
var ts = ['html', 'serve'];

var dest = {
    html: 'build/',
    css: 'build/css',
    fonts: 'build/fonts',
    img: 'build/img'
};
if (remote) {
    dest.html = '../foxfile/src/templates/';
    for (var k in dest) {
        if (k !== 'html') dest[k] = '../foxfile/src/public/' + k;
    }
}

gulp.task('build', ts);

gulp.task('js-watch', function (done) {
    webpack(require('./webpack.config.js'), function(err, stats) {
        browserSync.reload();
        done();
    });
});
function css(fileName) {
    return () => gulp.src([`src/css/${fileName}.*css`])
        .pipe(sass(argv.single ? {
            outputStyle: 'compressed'
        } : {}).on('error', sass.logError))
        .pipe(gulp.dest(dest.css))
        .pipe(gulpif(!argv.single, browserSync.stream()));
}
gulp.task('css', function() {
    let files = ['foxfile'];
    files.map(f => css(f)());
});
gulp.task('html', function() {
    return gulp.src("src/*.*html")
        .pipe(gulp.dest(dest.html))
});
gulp.task('html-watch', ['html'], function (done) {
    browserSync.reload();
    done();
});
gulp.task('fonts', function() {
    gulp.src("src/fonts/**").pipe(gulp.dest(dest.fonts));
    gulp.src("src/img/**").pipe(gulp.dest(dest.img));
});
gulp.task('serve', function() {
    browserSync.init({
        open: 'external',
        host: 'localhost',
        proxy: 'localhost',
        port: 80,
        notify: false
    });
    gulp.watch('src/js/**', ['js-watch']);
    gulp.watch('src/css/**', ['css']);
    gulp.watch('src/*.*html', ['html-watch']);
});
