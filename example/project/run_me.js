var gulp = require('gulp');
var concat = require('gulp-concat');
var gulpOverride = require('../../index.js');
// var tap = require('gulp-tap');
// var map = require('vinyl-map');

var options = {
        // priority == sort
        directories: ['./static/', './apps/', '../itcase-dev/'],  //
        type: 'css'
    };
var go = new gulpOverride(options);
var files = go.get_files();

for (var app in files) {
    // console.log('+++++++++++');
    // console.log(app);
    // console.log(files[app]);
    // console.log();
    gulp.src(files[app])
        // .pipe(map(function(code, filename) {
        //     console.log('FILE <<<<<<<<< ' + filename);
        // }))
        .pipe(concat(go.get_target(app)))
        .pipe(gulp.dest(go.get_dest(app)));
}
