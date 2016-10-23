var gulp = require('gulp');
var del = require('del');
var browserSync = require('browser-sync').create();
var directoryMap = require('gulp-directory-map');
var runSequence = require('run-sequence');
var nunjucks = require('gulp-nunjucks');
var rename = require('gulp-rename');
var data = require('gulp-data');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var sourcemaps = require('gulp-sourcemaps');
var babel = require('gulp-babel');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var plumber = require('gulp-plumber');

gulp.task('default', function(callback) {
    runSequence('clean:dist', 'css', 'js', 'sounds', 'mapAudio', 'nunjucks', 'browserSync', 'watch', callback);
});

gulp.task('clean:dist', function() {
    return del.sync('dist');
});

gulp.task('css', function() {
    var processors = [
        autoprefixer({browsers: ['last 1 version']}),
        cssnano()
    ];

    return gulp.src('./src/css/*.css')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(postcss(processors))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/css'));
});

gulp.task('js', function() {
    return gulp.src('./src/js/*.js')
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['es2015']
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/js'));
});

gulp.task('sounds', function() {
    return gulp.src('./src/mp3/**/*.*')
        .pipe(gulp.dest('./dist/mp3'));
});

gulp.task('mapAudio', function() {
    return gulp.src('./src/mp3/**/*.+(mp3|wav)')
        .pipe(directoryMap({
            filename: 'sounds.json'
        }))
        .pipe(gulp.dest('./dist'));
});

gulp.task('nunjucks', function() {
    return gulp.src('./src/index.nunjucks')
        .pipe(plumber())
        .pipe(data(function() {
            return {
                data: require('./dist/sounds.json'),
                settings: {
                    '0.25': '-0.25',
                    '0.50': '-0.50',
                    '0.75': '-0.75',
                    '1': '0',
                    '1.25': '+ 0.25',
                    '1.50': '+ 0.50',
                    '1.75': '+ 0.75'
                }
            };
        }))
        .pipe(nunjucks.compile())
        .pipe(rename('./dist/index.html'))
        .pipe(gulp.dest('./'));
});

gulp.task('browserSync', function() {
    browserSync.init({
        server: {
            baseDir: 'dist'
        }
    });
});

gulp.task('watch', function() {
    watch('./src/css/*.css', batch(function(events, done) {
        gulp.start('css', done);
    }));

    watch('./src/js/*.js', batch(function(events, done) {
        gulp.start('js', done);
    }));

    watch('./src/*.nunjucks', batch(function(events, done) {
        gulp.start('nunjucks', done);
    }));
});
