require('babel-core/register')

const gulp = require('gulp')
const babel = require('gulp-babel')
const eslint = require('gulp-eslint')
const del = require('del')

gulp.task('lint', () => {
  return gulp.src(['src/**/*.js'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError())
})

gulp.task('clean', () => {
  return del(['docs', 'dist'])
})

gulp.task('transpile', ['clean'], () => {
  return gulp.src('src/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('dist'))
})

gulp.task('build', ['transpile'])
gulp.task('default', ['lint', 'build'])
