const gulp = require('gulp')
const project = require('gulp-typescript').createProject('tsconfig.json');
const less = require('gulp-less');
const gulp_mocha = require('gulp-mocha');
const webpack = require('webpack-stream');
const webpack_config = require('./webpack.config.js');

gulp.task('compile-ts', async () => {
    return gulp.src('src/**/*.ts')
        .pipe(webpack(webpack_config))
        .pipe(gulp.dest('dist/'));
});

gulp.task('compile-less', () => {
    return gulp.src('src/styles/**')
        .pipe(less())
        .pipe(gulp.dest('dist/styles/'));
});

gulp.task('test', () => {
  return gulp.src('test/**/*.ts')
      .pipe(gulp_mocha({
        reporter: 'list',
        require: ['ts-node/register']
      }));
});

gulp.task('copy', async () => {
  return new Promise((resolve) => {
    gulp.src('README.md').pipe(gulp.dest("dist/"))
    gulp.src("src/module.json").pipe(gulp.dest('dist/'))
    gulp.src("src/packs/**").pipe(gulp.dest('dist/packs'))
    gulp.src("src/lang/**").pipe(gulp.dest('dist/lang/'))
    gulp.src("src/templates/**").pipe(gulp.dest('dist/templates/'))
    gulp.src("src/styles/**/*.css").pipe(gulp.dest('dist/styles/'))
    gulp.src("src/assets/**").pipe(gulp.dest('dist/assets/'))
    // @ts-ignore
    resolve();
  });
});

gulp.task('build', gulp.parallel('compile-ts', 'compile-less', 'copy', 'test'));

// Copy the dist folder into the modules directory for testing
// TODO - parameterize this property before asking anyone to contribute
const MODULEPATH = "../../dev-data/Data/modules/fabricate/";

gulp.task('foundry', () => {
  return gulp.src('dist/**').pipe(gulp.dest(MODULEPATH));
});

gulp.task("update", gulp.series('build', 'foundry'));
