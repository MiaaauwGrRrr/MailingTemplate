var gulp = require('gulp'),
    inlineCss = require('gulp-inline-css');
    pug = require('gulp-pug');
    htmlbeautify = require('gulp-html-beautify');


function defaultTask(cb) {
  // place code for your default task here
  cb();
}

exports.default = defaultTask

gulp.task('build', function buildHTML() {
    return gulp.src('views/*.pug')
        .pipe(pug())
        //.pipe(inlineCss())
        .pipe(htmlbeautify())
        .pipe(gulp.dest('build/'));
});