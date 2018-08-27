var gulp = require('gulp');
var browserSync = require('browser-sync');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var cp = require('child_process');
var jekyll = process.platform === "win32" ? "jekyll.bat" : "jekyll";
var deploy = require("gulp-gh-pages");
var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn(jekyll, ['build'], { stdio: 'inherit' }).on('close', done);

    // return cp.spawn('jekyll.bat', ['build'], { stdio: 'inherit' }).on('close', done);
    //return cp.exec('jekyll.bat', ['build', '--watch', '--incremental', '--force_polling'], { stdio: 'inherit' }).on('close', done);
    //return cp.exec('jekyll.bat', ['build'], {stdio: 'inherit'}).on('close', done);
    // return cp.spawn(jekyll, ['build', '--watch', '--incremental', '--force_polling'], { stdio: 'inherit' })
    // .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});


gulp.task('jekyll-watch', ['jekyll-build'], function (done) {
    browserSync.notify(messages.jekyllBuild);

    gulp.watch(['_scss/*.scss', '_scss/*/*.scss'], ['sass']);
    gulp.watch(['*.html', '_includes/*.html', '_includes/*/*.html', '_layouts/*.html', '_layouts/*/*.html', '_posts/*', 'js/*.js', 'images/*'], ['jekyll-rebuild']);

    browserSync({
        server: {
            baseDir: '_site'
        }
    });
    return cp.spawn(jekyll, ['build', '--watch', '--incremental', '--force_polling'], { stdio: 'inherit' }).on('close', done);
});


/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function () {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});


gulp.task('manual-watch', ['sass'], function () {
    gulp.watch(['_scss/*.scss', '_scss/*/*.scss'], ['sass']);
    gulp.watch(['*.html', '_includes/*.html', '_includes/*/*.html', '_layouts/*.html', '_layouts/*/*.html', '_posts/*', 'js/*.js', 'images/*'], ['jekyll-rebuild']);

    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    return gulp.src('_scss/*.scss')
        .pipe(sass({
            outputStyle: 'expanded',
            // sourceComments: 'map',
            includePaths: ['scss'],
            onError: browserSync.notify('Error in sass')
        }))
        .on('error', sass.logError)
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({ stream: true }))
        .pipe(gulp.dest('css'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch(['_scss/*.scss', '_scss/*/*.scss'], ['sass']);
    gulp.watch(['*.html', '_includes/*.html', '_includes/*/*.html', '_layouts/*.html', '_layouts/*/*.html', '_posts/*', 'js/*.js', 'images/*'], ['jekyll-rebuild']);

});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);



gulp.task("deploy", ["jekyll-build"], function () {
    return gulp.src("./_site/**/*")
        .pipe(deploy());
});
