var gulp = require('gulp');
    inlineCss = require('gulp-inline-css');
    pug = require('gulp-pug');
    htmlbeautify = require('gulp-html-beautify');
    browserSyncNL = require('browser-sync').create('nl');
    browserSyncFR = require('browser-sync').create('fr');
    cache = require('gulp-cache');
    minify = require('gulp-minifier');
    clean = require('gulp-clean');
    replace = require('gulp-replace');



// Default task (links from the package.json)
// TODO Add needed tasks to this AND update the Package.json for other command cases -> Build, Zip, Production ...
function defaultTask(cb) {
  // place code for your default task here
  cb();
}

exports.default = defaultTask
// This will build the email
  // TODO : ADD minifier and a stripper if needed

  gulp.task('clean', function () {
    return gulp.src('build/*html', {read: false})
        .pipe(clean());
});



gulp.task('build-nl', function buildHTML() {
    return gulp.src('views/master-template_NL.pug')
        .pipe(pug())
        //.pipe(inlineCss())
        .pipe(htmlbeautify())
        .pipe(replace('amp;', ''))
        //.pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest('build/'));
});

    
gulp.task('build-fr', function buildHTML() {
  return gulp.src('views/master-template_FR.pug')
      .pipe(pug())
      //.pipe(inlineCss())
      .pipe(htmlbeautify())
      .pipe(replace('amp;', ''))
      //.pipe(htmlmin({ collapseWhitespace: true }))
      
      .pipe(gulp.dest('build/'));
});


gulp.task('minifier', function() {
  return gulp.src('build/*.html').pipe(minify({
    minify: true,
    minifyHTML: {
      collapseWhitespace: true,
      conservativeCollapse: true,
    },
    minifyJS: {
      sourceMap: true
    },
    minifyCSS: true,
    getKeptComment: function (content, filePath) {
        var m = content.match(/\/\*![\s\S]*?\*\//img);
        return m && m.join('\n') + '\n' || '';
    }
  })).pipe(gulp.dest('dest'));
});


// Creates a local version of the master-template -> 
  // TODO  Create another one for FR version AND change the name of the master-template to something more logical
gulp.task('browser-sync', function(done) {
  browserSyncNL.init({
    //files: ["./views/master-template.pug", "views/style.css", "views/includes/*.pug"],
    port: 3000,
    server: {
      baseDir: "./build",
      index: "master-template_NL.html",
      watch: true
    },
    ghostMode: true
  });

  browserSyncFR.init({
    port: 3004,
    ui: {
        port: 3004
    },
    server: {
        baseDir: "./build",
        index: "master-template_FR.html",
        watch: true
    },
    ghostMode: false
});

  done();
});

// Clears cache on every build and every watch event (refresh of local site)
gulp.task('clearCache', function(done) {
    cache.clearAll();
  done();
  });

gulp.task('watch', function() {
  gulp.watch("views/master-template*.pug").on("all", gulp.series("build-nl","build-fr","clearCache", gulp.parallel(browserSyncNL.reload), gulp.parallel(browserSyncNL.reload)));
  gulp.watch("views/style.css").on("all", gulp.series("build-nl","build-fr","clearCache", gulp.parallel(browserSyncNL.reload), gulp.parallel(browserSyncNL.reload)));
  gulp.watch("views/includes/*.*").on("all", gulp.series("build-nl","build-fr","clearCache", gulp.parallel(browserSyncNL.reload), gulp.parallel(browserSyncNL.reload)));
  gulp.watch("views/includes/*/*.*").on("all", gulp.series("build-nl","build-fr","clearCache", gulp.parallel(browserSyncNL.reload), gulp.parallel(browserSyncNL.reload)));
  gulp.watch("views/includes/*/*/*.*").on("all", gulp.series("build-nl","build-fr","clearCache", gulp.parallel(browserSyncNL.reload), gulp.parallel(browserSyncNL.reload)));
});


gulp.task("alle", gulp.series("clean", "build-nl","build-fr", "minifier", "browser-sync", "clearCache", "watch" ));
