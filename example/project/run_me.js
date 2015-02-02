var gulp = require('gulp');
var gulpOverride = require('../../index.js');


var options = {
        // priority == sort
        directories: ['./apps/', '../itcase-dev/'],
        type: 'css'
    };

gulp.src('./static/').pipe(gulpOverride(options));
    // .pipe(gulp.dest('./tst_res/'));
