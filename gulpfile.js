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
    archive = require('gulp-zip');
    clean_directory = require('gulp-clean');
    fs = require('fs');



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
  })).pipe(gulp.dest('build'));
});


gulp.task('preZipIndexNL', function() {
  return gulp.src('build/master-template_NL.html')
  .pipe(gulp.dest('build/zip_temp/NL'))
});
gulp.task('preZipAssetsNL', function() {
  return gulp.src(['build/img/**'])
    .pipe(gulp.dest('build/zip_temp/NL/img'))
});
gulp.task('zip-nl', function() {
  return gulp.src(['build/zip_temp/NL/**'])
      .pipe(archive('NL.zip'))
      .pipe(gulp.dest('build/zip'))
});

gulp.task('preZipIndexFR', function() {
  return gulp.src('build/master-template_FR.html')
  .pipe(gulp.dest('build/zip_temp/FR'))
});
gulp.task('preZipAssetsFR', function() {
  return gulp.src(['build/img/**'])
    .pipe(gulp.dest('build/zip_temp/FR/img'))
});
gulp.task('zip-fr', function() {
return gulp.src(['build/zip_temp/FR/**'])
    .pipe(archive('FR.zip'))
    .pipe(gulp.dest('build/zip'))
});

gulp.task('delete-temp', function () {
return gulp.src(['build/zip_temp'])
    .pipe(clean_directory())
});


async function GetBlockNames() {
  return new Promise((resolve, reject) => {
    fs.readFile('test.pug', 'utf8', function (err,data) {
      if (err) return console.log(err);
      let matches = data.match(/\+([^\(\{]+\(\{[^\)\}]+\}\))/gm);
      let templateBlocks = {};
      for(var i = 0; i < matches.length; i++) {
        var name = matches[i].match(/\+([^\(\{]+)/)[1];
        templateBlocks[name] = matches[i];
      }
      resolve(templateBlocks);
    });
  })
}

gulp.task('fillInBlocks', function(done) {
  GetBlockNames().then(result => {
    let src = gulp.src(['views/Mixin/content_*.pug']);
    Object.keys(result).forEach(key => { 
      src = src.pipe(replace(new RegExp(`^${key}$`, 'gm'), result[key]));
    });
    src.pipe(gulp.dest('views/Mixin/'));
    done();
  });
});


// Copy and compress into Zip
function zip() {
  var dist = "dist";
  var ext = ".html";

  function getHtmlFiles(dir) {
    return fs.readdirSync(dir).filter(function(file) {
      var fileExt = path.join(dir, file);
      var isHtml = path.extname(fileExt) == ext;
      return fs.statSync(fileExt).isFile() && isHtml;
    });
  }

  var htmlFiles = getHtmlFiles(dist);

  var moveTasks = htmlFiles.map(function(file) {
    var sourcePath = path.join(dist, file); //           dist/index.html
    var fileName = path.basename(sourcePath, ext); //    index

    var moveHTML = gulp.src(sourcePath).pipe(
      $.rename(function(path) {
        path.dirname = fileName;
        return path;
      })
    );

    var moveImages = gulp
      .src(sourcePath)
      .pipe($.htmlSrc({ selector: "img" }))
      .pipe(
        $.rename(function(path) {
          path.dirname = fileName + path.dirname.replace(dist, "");
          return path;
        })
      );

    return merge(moveHTML, moveImages)
      .pipe($.zip(fileName + ".zip"))
      .pipe(gulp.dest(dist));
  });

  return merge(moveTasks);
}

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
  gulp.watch("views/**/*.pug").on("all", gulp.series("build-nl","build-fr","clearCache", gulp.parallel(browserSyncNL.reload, browserSyncFR.reload)));
  gulp.watch("views/**/*.css").on("all", gulp.series("build-nl","build-fr","clearCache", gulp.parallel(browserSyncNL.reload, browserSyncFR.reload)));
});


gulp.task("alle", gulp.series("clean", "build-nl","build-fr", "minifier", "browser-sync", "clearCache", "watch" ));
gulp.task("zip", gulp.series("clean", "build-nl", "build-fr", "minifier", "preZipIndexNL", "preZipIndexFR", "preZipAssetsNL", "preZipAssetsFR", "zip-nl", "zip-fr", "delete-temp"));
gulp.task("test", gulp.series("fillInBlocks"));
