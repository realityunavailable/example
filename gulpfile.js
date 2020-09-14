var { watch, src, dest, parallel, series } = require("gulp");
var plumber = require("gulp-plumber");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var pug = require("gulp-pug");
var imagemin = require("gulp-imagemin");
var del = require("del");

function clearBuild() {
  return del("build/!(fonts)");
}

function buildPages() {
  return src("src/blocks/*.pug")
    .pipe(
      pug({
        pretty: false,
      })
    )
    .pipe(dest("build/blocks/"));
}

function buildHTMLDist() {
  return src("src/*.pug")
    .pipe(
      pug({
        pretty: false,
      })
    )
    .pipe(dest("dist"));
}

function buildStyles() {
  return src("src/styles/*.scss")
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(dest("build/styles/"));
}

function buildScripts() {
  return src("src/scripts/**/*.js").pipe(dest("build/scripts/"));
}

function buildAssets(cb) {
  // Уберём пока картинки из общего потока
  src(["src/assets/**/*.*", "!src/assets/img/**/*.*"]).pipe(
    dest("build/assets/")
  );
  src("src/assets/img/**/*.*").pipe(imagemin()).pipe(dest("build/assets/img"));
  cb();
}

function watchFiles() {
  watch("src/scripts/**/*.js", buildScripts);
  watch("src/assets/**/*.*", buildAssets);
  watch("src/styles/*.scss", buildStyles);
  watch(["src/pages/**/*.pug", "src/blocks/**/*.pug"], buildPages);
  watch("src/*.pug", buildHTMLDist);
}

exports.default = series(
  clearBuild,
  parallel(
    series(
      parallel(buildPages, buildStyles, buildScripts, buildAssets, buildHTMLDist),
      watchFiles
    )
  )
);