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

#### File structure
```js
.
├── example
|   ├── static
|       ├── some_app1
|           ├── some_app1_file1.css
|           └── some_app1_file2.css
|       └── some_app3
|           ├── some_app3_file1.css
|           └── some_app3_file2.css
|   ├── app
|       ├── some_app2
|           ├── some_app2_file1.css
|           └── some_app2_file2.css
|       └── some_app5
|           ├── some_app5_file1.css
|           └── some_app5_file2.css
|   └── modules
|       ├── some_app1
|           ├── some_app1_file1.css
|           ├── some_app1_file2.css
|           └── some_app1_file3.css
|       └── some_app2
|           └── some_app2_file3.css
|       └── some_app6
|           └── some_app6_file1.css
```

#### Result
```js
.
├── example
|   ├── static
|       ├── some_app1
|           ├── __some_app1.css // include static/some_app1/some_app1_file1.css, static/some_app1/some_app1_file1.css, modules/some_app1_file3.css
|           ├── some_app1_file1.css
|           └── some_app1_file2.css
|       └── some_app3
|           ├── __some_app3.css // include static/some_app3_file1.css, static/some_app3_file2.css
|           ├── some_app3_file1.css
|           └── some_app3_file2.css
|   ├── app
|       ├── some_app2
|           ├── __some_app2.css // include app/some_app2_file1.css, app/some_app2_file2.css, modules/some_app2_file3.css
|           ├── some_app2_file1.css
|           └── some_app2_file2.css
|       └── some_app5
|           ├── __some_app5.css // include app/some_app5_file1.css, app/some_app5_file2.css
|           ├── some_app5_file1.css
|           └── some_app5_file2.css
|   └── modules
|       ├── some_app1
|           ├── some_app1_file1.css
|           ├── some_app1_file2.css
|           └── some_app1_file3.css
|       └── some_app2
|           └── some_app2_file3.css
|       └── some_app6
|           ├── __some_app6.css // include modules/some_app6_file1.css
|           └── some_app6_file1.css
```


## Options

### directories

Type: `Array` Default: `null`

### modules_dir

Type: `Array` Default: `null`

### ignore_dirs

Type: `String` Default: ['node_modules', 'bower_components']

### ignore_modules

Type: `String` or `Array` Default: `null`

###target_prefix

Type: `String` Default: `__`

### type

Type: `String` or `Array` Default: `null`

## API

### `get_files(app_name)`
* **dest** - `string` Path to destination directory or file.

### `get_dest(app_name)`
* **dest** - `string` Path to destination directory or file.

### `get_target(app_name)`
* **dest** - `string` Path to destination directory or file.

## License

MIT © [ITCase](http://itcase.pro/)