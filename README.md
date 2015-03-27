# gulp-concat-redefine 

----------

> Finds redefined files and concat in one

A [Gulp](http://gulpjs.com/) plugin for finding redefined application files and concat them in one.

# Getting Started

----------

```
$ npm install gulp-concat-redefine --save-dev
```

## Create a gulpfile.js at the root of your project:

```js
var gulp = require('gulp');
var concat = require('gulp-concat');
var concat-redefine = require('gulp-concat-redefine');

gulp.task('default', function () {

    var options = {
        directories: {
            ['./static/', '1'],
            ['./app/', '2'],
            ['./modules/', '3']
        },
        type: 'css'
    };

    var concateRedefine = new concatRedefine(options);
    var files = concateRedefine.get_files();

    for (var app in files) {
        return gulp.src(files[app])
            .pipe(concat(concateRedefine.get_target(app)))
            .pipe(gulp.dest(concateRedefine.get_dest(app)));
    }
});
```

## How it work

`gulp-concat-redefine` search redefined files from `directories`, then compares it and create one file from redefined files.

![How it work](docs/app1.png)


#Recipes

----------

 - [Redefine Django contrib admin](aasdfasdf)


```js
var gulp = require('gulp');
var concat = require('gulp-concat');
var concat-redefine = require('gulp-concat-redefine');

gulp.task('default', function () {

    var options = {
        directories: {
            ['./static/', '1'],
            ['./virtualenv/demo-site/Lib/site-  packages/django/contrib/admin/static/', '2'],
        },
        type: 'css'
    };

    var concateRedefine = new concatRedefine(options);
    var files = concateRedefine.get_files();

    for (var app in files) {
        return gulp.src(files[app])
            .pipe(concat(concateRedefine.get_target(app)))
            .pipe(gulp.dest(concateRedefine.get_dest(app)));
    }
});
```


# Options

----------

## directories

Type: `Array` Default: `null`

List of directories to search for files

### Example: 
```js
     directories: {
          ['./static/', '1'] 
     }
```
## modules_dir

Type: `Array` Default: `null`

## ignore_dirs

Type: `String` Default: ['node_modules', 'bower_components']

List of directories that should be ignored

## ignore_modules

Type: `String` or `Array` Default: `null`

## target_prefix

Type: `String` Default: `__`

```js
     target_prefix: '__bunde__' 
     type: 'css' 
```
> Returns file named: `__bunde__app-name.css`

## type

Type: `String` or `Array` Default: `null`

### Example: 
```js
     type: ['css', 'js'] 
```

## API

### `get_files(app_name)`
* **app_name** - `string` 

### `get_dest(app_name)`
* **app_name** - `string` 

### `get_target(app_name)`
* **app_name** - `string` 

# License

----------

MIT © [ITCase](http://itcase.pro/)