\[\[Build Status\]\[travis-image\]\]\[travis-url\]
\[\[CoverallsStatus\]\[coveralls-image\]\]\[coveralls-url\]

# gulp-concat-redefine

> Finds redefined files and concat in one

A [Gulp][] plugin for finding redefined application files and concat
them in one.

# Getting Started

## Install

    $ npm install gulp-concat-redefine --save-dev

## Example

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

## gulpfile.js

``` js
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

`cr.get_target` returns name of building file by application name:

    __bar.css
    __foo.css
    __baz.css

`cr.get_dest` returns destination for concatenated file:

    ./static/bar/css/
    ./static/foo/css/
    ./apps/baz/css/

## How it work

`gulp-concat-redefine` search redefined files from `directories`, then
compares it and create one file from redefined files.

![How it work][]

# API

## ConcatRedefine(options)

### Options

List of parameters for file collection.

### options.directories

List of directories to search for files.

Type: `Array`

*Required*

> Each directory should contain a list of applications for file search.
> Redefinition in order of priority directories.

### options.type

Extension of files for collection.

Type: `String`

*Required*

### options.modules_dir

Path to the directory modules added to the project.

Type: `String`

Default: last of `options.directories`

### options.corm

Collect only redefined modules.

Type: `Boolean`

Default: `true`

> if ‘false’, p

  [Gulp]:
  [How it work]: docs/app1.png
