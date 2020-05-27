var gulp = require('gulp');
    inlineCss = require('gulp-inline-css');
    pug = require('gulp-pug');
    htmlbeautify = require('gulp-html-beautify');
    browserSync = require('browser-sync').create();
    cache = require('gulp-cache');


// Default task (links from the package.json)
// TODO Add needed tasks to this AND update the Package.json for other command cases -> Build, Zip, Production ...
function defaultTask(cb) {
  // place code for your default task here
  cb();
}

exports.default = defaultTask
// This will build the email
  // TODO : ADD minifier and a stripper if needed
    
gulp.task('build', function buildHTML() {
    return gulp.src('views/*.pug')
        .pipe(pug())
        //.pipe(inlineCss())
        .pipe(htmlbeautify())
        .pipe(gulp.dest('build/'));
});
// Creates a local version of the master-template -> 
  // TODO  Create another one for FR version AND change the name of the master-template to something more logical
gulp.task('browser-sync', function(done) {
  browserSync.init({
    //files: ["./views/master-template.pug", "views/style.css", "views/includes/*.pug"],
    port: 3000,
    server: {
      baseDir: "./build",
      index: "master-template.html",
      watch: true
    },
    ghostMode: true
  });
  done();
});
// Clears cache on every build and every watch event (refresh of local site)
gulp.task('clearCache', function(done) {
    cache.clearAll();
  done();
  });

gulp.task('watch', function() {
  gulp.watch("views/master-template.pug").on("all", gulp.series("build","clearCache", gulp.parallel(browserSync.reload)));
  gulp.watch("views/style.css").on("all", gulp.series("build","clearCache", gulp.parallel(browserSync.reload)));
  gulp.watch("views/includes/*.*").on("all", gulp.series("build","clearCache", gulp.parallel(browserSync.reload)));
  gulp.watch("views/includes/*/*.*").on("all", gulp.series("build","clearCache", gulp.parallel(browserSync.reload)));
});


gulp.task("alle", gulp.series("build","browser-sync","clearCache", "watch" ));
