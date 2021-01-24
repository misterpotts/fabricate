const gulp = require('gulp')
const project = require('gulp-typescript').createProject('tsconfig.json');
const less = require('gulp-less');
const gulp_mocha = require('gulp-mocha');

gulp.task('compile-ts', () => {
  return gulp.src('src/**/*.ts')
    .pipe(project())
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
  return new Promise((resolve, reject) => {
    gulp.src('README.md').pipe(gulp.dest("dist/"))
    gulp.src("src/module.json").pipe(gulp.dest('dist/'))
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
