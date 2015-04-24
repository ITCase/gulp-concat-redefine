[![Build Status](https://travis-ci.org/ITCase/gulp-concat-redefine.svg?branch=master)](https://travis-ci.org/ITCase/gulp-concat-redefine)
[![Coverage Status](https://coveralls.io/repos/ITCase/gulp-concat-redefine/badge.svg)](https://coveralls.io/r/ITCase/gulp-concat-redefine)

# gulp-concat-redefine

> Finds redefined files and concat in one

A [Gulp](http://gulpjs.com/) plugin for finding redefined application files and concat them in one.

# Getting Started

## Install

```
$ npm install gulp-concat-redefine --save-dev
```

## Example

```
modules/
   ├── bar/
   │   └── css/
   │       ├── bar.css
   │       └── bar-menu.css
   └── baz/
       └── css/
           └── baz.css

project/
    ├── gulpfile.js
    ├── apps/
    │   ├── foo/
    │   │   └── css/
    │   │       ├── foo.css
    │   │       └── foo-title.css
    │   └── baz/
    │       └── css/
    │           └── custom.css
    └── static/
        ├── foo/
        │   └── css/
        │       └── foo-title.css
        └── bar/
            └── css/
                └── bar.css
```

## gulpfile.js

```js
var gulp = require('gulp');
var concat = require('gulp-concat');
var ConcatRedefine = require('gulp-concat-redefine');

var cr = new ConcatRedefine({
    directories: ['./static/', './apps/', '../modules/'],
    type: 'css'
});

gulp.task('css', function() {
    for (var app_name in cr.files) {
        gulp.src(cr.files[app_name])
            .pipe(concat(cr.get_target(app_name)))
            .pipe(gulp.dest(cr.get_dest(app_name)));
    }
});
```
in `cr.files` stored object with files:
```
{
  bar:
   [ './static/bar/css/bar.css',
     '../modules/bar/css/bar-menu.css' ],
  foo:
   [ './static/foo/css/foo-title.css',
     './apps/foo/css/foo.css' ],
  baz:
   [ './apps/baz/css/custom.css',
     '../modules/baz/css/baz.css' ]
}
```
`cr.get_target` returns name of building file by application name:
```
__bar.css
__foo.css
__baz.css
```
`cr.get_dest` returns destination for concatenated file:
```
./static/bar/css/
./static/foo/css/
./apps/baz/css/
```

## How it work

`gulp-concat-redefine` search redefined files from `directories`, then compares it and create one file from redefined files.

![How it work](docs/app1.png)


# API

## ConcatRedefine(options)
### Options
List of parameters for file collection.

### options.directories
List of directories to search for files.

Type: `Array`

_Required_

> Each directory should contain a list of applications for file search. Redefinition in order of priority directories.

### options.type
Extension of files for collection.

Type: `String`

_Required_


### options.modules_dir
Path to the directory modules added to the project.

Type: `String`

Default: last of `options.directories`


### options.corm
Collect only redefined modules.

Type: `Boolean`

Default: `true`

> if 'false', plugin collects all files from modules directory.


### options.ignore_dirs
Files in the specified directories will be ignored for all applications.

Type: `Array`

Default: `['node_modules', 'bower_components']`


### options.ignore_modules
Specified applications will be ignored for `options.modules_dir` directory.

Type: `Array`

Default: []


### options.modules_prefix
Prefix for applications names in `options.modules_dir` directory.

Type: `String` or `Array`

Default: []

> e.g. ['django-', 'pyramid_']. if you have 'django-someapp/someapp/' or some.


### options.target_prefix
Prefix for target file name.

Type: `String`

Default: '__'


### Properties
* `ConcatRedefine.opts` - The "options" object passed on initialization.
* `ConcatRedefine.files` - Object that stores a list of files for each application.


## Methods
### ConcatRedefine.get_files()
Rebuild and returns `ConcatRedefine.files`.

Type: `Object`


### ConcatRedefine.get_all_files()
Returns list of all collected files.

Type: `Array`


### ConcatRedefine.get_dest(key)
`key` - key from `ConcatRedefine.files`.

Returns destination path.

Type: `String`


### ConcatRedefine.get_target(key)
`key` - key from `ConcatRedefine.files`.

Returns target file name.

Type: `String`


### ConcatRedefine.get_all_targets()
Returns list of target files.

Type: `Array`


### ConcatRedefine.get_watch_patterns()
Returns glob patterns.

Type: `Array`


# Recipes

 - Redefine Django or Pyramid app


```js
var gulp = require('gulp');
var concat = require('gulp-concat');
var minifyCSS = require('gulp-minify-css');
var watch = require('gulp-watch');
var ConcatRedefine = require('gulp-concat-redefine');
var cr = new ConcatRedefine({
        directories: ['./static/', './apps/'],
        modules_dir: '../modules/',
        corm: false,
        ignore_dirs: ['node_modules', 'bower_components', 'tests', '_build', 'plugins', 'lib'],
        modules_prefix: ['django-', 'pyramid_'],
        type: 'css'
    });

gulp.task('css', function() {
    for (var app_name in cr.get_files()) {
        gulp.src(cr.files[app_name])
            .pipe(minifyCSS())
            .pipe(concat(cr.get_target(app_name)))
            .pipe(gulp.dest(cr.get_dest(app_name)));
    }
});


gulp.task('watch', function() {
    watch(cr.get_watch_patterns(), { verbose: true }, function () {
        gulp.start('css');
    });
});
```

# License

The project is licensed under the MIT license.