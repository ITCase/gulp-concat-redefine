# gulp-concat-redefine 

> Finds redefined files and concat in one

A [Gulp](http://gulpjs.com/) plugin for finding redefined application files and concat them in one.

## Install

```
$ npm install --save-dev gulp-concat-redefine
```


## Usage

```js
var gulp = require('gulp');
var concat = require('gulp-concat');
var concat-redefine = require('gulp-concat-redefine');

gulp.task('default', function () {

    var options = {
        // priority == sort
        directories: [
            './static/',
            './app/',
            './modules/',
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

List of directories to search for files

### modules_dir

Type: `Array` Default: `null`

### ignore_dirs

Type: `String` Default: ['node_modules', 'bower_components']

List of directories that should be ignored

### ignore_modules

Type: `String` or `Array` Default: `null`

###target_prefix

Type: `String` Default: `__`

Returns file named: `__appname`

### type

Type: `String` or `Array` Default: `null`

#### Example

```js
    var options = {
        directories: [
            './static/',
            './app/',
            './modules/',
        ],
        type: 'css'
    };
```


## API

### `get_files(app_name)`
* **app_name** - `string` 

### `get_dest(app_name)`
* **app_name** - `string` 

### `get_target(app_name)`
* **app_name** - `string` 

## License

MIT © [ITCase](http://itcase.pro/)