var gulp = require('gulp');
var concat = require('gulp-concat');
var gulpOverride = require('../../index.js');
// var tap = require('gulp-tap');
// var map = require('vinyl-map');

var options = {
        // priority == sort
        directories: ['./static/', './apps/', '../itcase-dev/'],
        type: 'css'  // js
    };
var go = new gulpOverride(options);
var apps_files = go.get_files();

console.log('====');
console.log(apps_files);
console.log();

for (var app_name in apps_files) {
    gulp.src(apps_files[app_name])
        // .pipe(map(function(code, filename) {
        //     console.log('FILE  <<<<<<<<<  ' + filename);
        // }))
        .pipe(concat(go.get_target(app_name)))
        .pipe(gulp.dest(go.get_dest(app_name)));
}
