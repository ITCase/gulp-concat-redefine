# gulp-concat-redefine 

> Finds redefined files and concat in one

A [Gulp](http://gulpjs.com/) plugin for finding redefined application files and concat them in one.

## Install

```
$ npm install --save-dev gulp-concat-redefine
```


## Usage

### Simple

```js
var gulp = require('gulp');
var concat = require('gulp-concat');
var gulp-concat-redefine = require('gulp-concat-redefine');

gulp.task('default', function () {

    var options = {
        // priority == sort
        directories: [
            './static/',
            './app/',
        ],
        type: 'css'
    };

    var concateRedefine = new concatRedefine(options);
    var apps_files = concateRedefine.get_files();

    for (var app_name in apps_files) {
        return gulp.src(apps_files[app_name])
            .pipe(concat(concateRedefine.get_target(app_name)))
            .pipe(gulp.dest(concateRedefine.get_dest(app_name)));
    }
});
```

## Options

### directories

Type: `Array` Default: `null`

### modules_dir

Type: `String` Default: `null`

### ignore_modules

Type: `String` or `Array` Default: `null`

### type

Type: `String` or `Array` Default: `null`

## License

MIT © [ITCase](http://itcase.pro/)
