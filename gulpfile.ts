const gulp = require('gulp')
const ts = require('gulp-typescript');
const less = require('gulp-less');
const project = ts.createProject('tsconfig.json');

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

gulp.task('copy', async () => {
  return new Promise((resolve, reject) => {
    gulp.src('README.md').pipe(gulp.dest("dist/"))
    gulp.src("src/module.json").pipe(gulp.dest('dist/'))
    gulp.src("src/lang/**").pipe(gulp.dest('dist/lang/'))
    gulp.src("src/templates/**").pipe(gulp.dest('dist/templates/'))
    gulp.src("src/styles/**/*.css").pipe(gulp.dest('dist/styles/'))
    gulp.src("src/assets/**").pipe(gulp.dest('dist/assets/'))
    resolve();
  });
});

gulp.task('build', gulp.parallel('compile-ts', 'compile-less', 'copy'));

// This is supposed to copy the dist folder into the modules directory for testing. Only works if you've set it up the right way
const MODULEPATH = "../../dev-data/Data/modules/fabricate/";

gulp.task('foundry', () => {
  return gulp.src('dist/**').pipe(gulp.dest(MODULEPATH));
});

gulp.task("update", gulp.series('build', 'foundry'));
