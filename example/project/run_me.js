var gulp = require('gulp');
var concat = require('gulp-concat');
var gulpOverride = require('../../index.js');  // 'gulp-override'
// var tap = require('gulp-tap');
// var map = require('vinyl-map');

var options = {
        // priority == sort
        directories: ['./static/', './apps/', '../itcase-dev/'],
        type: 'css'  // js
        // modules_dir: '../itcase-dev/',
        // ignore_dirs: ['node_modules', 'bower_components', 'some_dir_name'],
        // ignore_modules: ['some_dir_name'],
        // target_prefix = 'proj_'
    };

var go = new gulpOverride(options);
var apps_files = go.get_files();

console.log('\n ===========');
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
