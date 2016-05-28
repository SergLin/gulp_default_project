'use strict';

var gulp = require('gulp'),
    watch = require('gulp-watch'),
    prefixer = require('gulp-autoprefixer'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cleanCSS = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    browserSync = require("browser-sync"),
    notify = require('gulp-notify'),
    jade = require('gulp-jade'),
    pug = require('gulp-pug'),
    reload = browserSync.reload;

var path = {
    dist: { //Тут мы укажем куда складывать готовые после сборки файлы
        pug: 'dist/',
        jade: 'dist/',
        html: 'dist/',
        js: 'dist/js/',
        css: 'dist/css/',
        img: 'dist/img/',
        fonts: 'dist/fonts/'
    },
    src: { //Пути откуда брать исходники
        pug: 'src/*.pug', //Синтаксис src/*.pug говорит gulp что мы хотим взять все файлы с расширением .html
        jade: 'src/*.jade', //Синтаксис src/*.jade говорит gulp что мы хотим взять все файлы с расширением .html
        html: 'src/*.html', //Синтаксис src/*.html говорит gulp что мы хотим взять все файлы с расширением .html
        js: 'src/js/main.js',//В стилях и скриптах нам понадобятся только main файлы
        style: 'src/sass/style.scss',
        img: 'src/img/**/*.*', //Синтаксис img/**/*.* означает - взять все файлы всех расширений из папки и из вложенных каталогов
        fonts: 'src/fonts/**/*.*'
    },
    watch: { //Тут мы укажем, за изменением каких файлов мы хотим наблюдать
        pug: 'src/**/*.pug',
        jade: 'src/**/*.jade',
        html: 'src/**/*.html',
        js: 'src/js/**/*.js',
        style: 'src/sass/**/*.scss',
        img: 'src/img/**/*.*',
        fonts: 'src/fonts/**/*.*'
    },
    clean: './dist'
};

//Переменная с настройками dev сервера:

var config = {
    server: {
        baseDir: "./dist"
    },
    tunnel: true,
    host: 'localhost',
    port: 9000,
    logPrefix: "Frontend_Devil"
};

//Таск для сборки pug:

gulp.task('pug:dist', function() {
   gulp.src(path.src.pug)
      .pipe(pug({
        // Your options in here. 
      }))
      .pipe(gulp.dest(path.dist.pug)) //Выплюнем их в папку dist
      .pipe(reload({stream: true})) //И перезагрузим наш сервер для обновлений
});

//Таск для сборки jade:

gulp.task('jade:dist', function() {
  var YOUR_LOCALS = {};
 
  gulp.src(path.src.jade) //Выберем файлы по нужному пути
    .pipe(jade({
      locals: YOUR_LOCALS
    }))
    .pipe(gulp.dest(path.dist.jade)) //Выплюнем их в папку dist
    .pipe(reload({stream: true})) //И перезагрузим наш сервер для обновлений
    // .pipe(notify('JADE - ГотовеньКО!!!'));
});

//Таск для сборки html:

gulp.task('html:dist', function () {
    gulp.src(path.src.html) //Выберем файлы по нужному пути
        .pipe(rigger()) //Прогоним через rigger
        .pipe(gulp.dest(path.dist.html)) //Выплюнем их в папку dist
        .pipe(reload({stream: true})) //И перезагрузим наш сервер для обновлений
        // .pipe(notify('HTML - ГотовеньКО!!!'));
});

//Таск по сборке скриптов:

gulp.task('js:dist', function () {
    gulp.src(path.src.js) //Найдем наш main файл
        .pipe(rigger()) //Прогоним через rigger
        .pipe(sourcemaps.init()) //Инициализируем sourcemap
        .pipe(uglify()) //Сожмем наш js
        .pipe(sourcemaps.write()) //Пропишем карты
        .pipe(gulp.dest(path.dist.js)) //Выплюнем готовый файл в dist
        .pipe(reload({stream: true})) //И перезагрузим сервер
        // .pipe(notify('JS - ГотовеньКО!!!')); 
});

//Таск для сборки SCSS:

gulp.task('style:dist', function () {
    gulp.src(path.src.style) //Выберем наш main.scss
        .pipe(sourcemaps.init()) //То же самое что и с js
        .pipe(sass()) //Скомпилируем
        .pipe(prefixer({browsers: ['last 10 versions']})) //Добавим вендорные префиксы
        .pipe(cleanCSS()) //Сожмем
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(path.dist.css)) //И в dist
        .pipe(reload({stream: true}))
        // .pipe(notify('CSS - ГотовеньКО!!!'));
});

//Таск по картинкам:

gulp.task('image:dist', function () {
    gulp.src(path.src.img) //Выберем наши картинки
        .pipe(imagemin({ //Сожмем их
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()],
            interlaced: true
        }))
        .pipe(gulp.dest(path.dist.img)) //И бросим в dist
        .pipe(reload({stream: true}))
        // .pipe(notify('PIC - ГотовеньКО!!!'));
});

//Таск по шрифтам:

gulp.task('fonts:dist', function() {
    gulp.src(path.src.fonts)
        .pipe(gulp.dest(path.dist.fonts))
});

//Таск сборки:

gulp.task('dist', [
    'pug:dist',
    'jade:dist',
    'html:dist',
    'js:dist',
    'style:dist',
    'fonts:dist',
    'image:dist'
]);

//Таск по отслеживанию изменений:

gulp.task('watch', function(){
     watch([path.watch.pug], function(event, cb) {
        gulp.start('pug:dist');
    });
    watch([path.watch.jade], function(event, cb) {
        gulp.start('jade:dist');
    });
    watch([path.watch.html], function(event, cb) {
        gulp.start('html:dist');
    });
    watch([path.watch.style], function(event, cb) {
        gulp.start('style:dist');
    });
    watch([path.watch.js], function(event, cb) {
        gulp.start('js:dist');
    });
    watch([path.watch.img], function(event, cb) {
        gulp.start('image:dist');
    });
    watch([path.watch.fonts], function(event, cb) {
        gulp.start('fonts:dist');
    });
});

//Таск - чудо livereload:

gulp.task('webserver', function () {
    browserSync(config);
});

//Таск - очистка папки проекта:

gulp.task('clean', function (cb) {
    rimraf(path.clean, cb);
});

// Дефолтный таск:

gulp.task('default', ['dist', 'webserver', 'watch']);