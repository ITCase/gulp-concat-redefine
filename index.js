// var buffer = require('vinyl-buffer'),
//     map = require('vinyl-map'),
//     source = require('vinyl-source-stream'),
//     vinylPaths = require('vinyl-paths');

var _ = require("underscore");
var globby = require("globby");
var minimatch = require("minimatch");
var path = require('path');
var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;


// Consts
var PLUGIN_NAME = 'gulp-override';

// function gulp_override (options) {
//     options = options || {};

//     return through.obj(function (file, enc, cb) {
//         // Find folders in project apps and static paths
//         var filepath = file.path;
//         var cwd = file.cwd;
//         var relative = path.relative(cwd, filepath);

//         var appList = globby.sync(relative + '/*/');
//         var list = [];

//         appList.forEach(function(folder) {
//             appName = folder.match(/.+\/(.+)\/$/)[1];
//             list.push(appName);
//         });

//         list = _.uniq(list);

//     }, function (cb) {
//         cb();
//     });
// }


function clean_files(files_list) {
    return files_list.map(function (path) {
        var path_list = path.split('/');
        return path_list[path_list.length-1];
    });
}

function get_files(main_directory, directories, type) {
    // var files_pattern = '**/*.' + options.type;
    // var ignore_pattern = '**/'+ options.ignore + '/';
    // return globby.sync([folder + files_pattern,
    //                     '!' + folder + ignore_pattern + files_pattern]);

    var files = [];
    var files_pattern = '**/*.' + type;
    globby.sync(main_directory + '/*/').forEach(function(folder) {
        var appName = folder.match(/.+\/(.+)\/$/)[1] + '/';
        var main_files = globby.sync([folder + files_pattern]);
        var check_list = clean_files(main_files);

        files.push.apply(files, main_files);

        for (var i in directories) {
            var module_files = globby.sync([directories[i] + appName + files_pattern]);
            var clean_module_files = clean_files(module_files);

            for (var j in clean_module_files) {
                if (check_list.indexOf(clean_module_files[j]) < 0) {
                    files.push(module_files[j]);
                    check_list.push(clean_module_files[j]);
                }
            }
        }
    });
    return files;
}

// Plugin level function(dealing with files)
function gulp_override(options) {
    options = options || {};

    if (!options.directories) {
        throw new PluginError(PLUGIN_NAME, 'Missing directories argument!');
    }

    // Creating a stream through which each file will pass
    return through.obj(function(file, enc, cb) {
        var filepath = file.path;
        var cwd = file.cwd;
        var relative = path.relative(cwd, filepath);

        // if (file.isNull()) {
        //     cb(null, file);  // return empty file
        // }
        // if (file.isBuffer() || file.isStream()) {
        //     throw new PluginError(PLUGIN_NAME, 'Wrong format');
        // }

        var res = get_files(relative, options.directories, options.type);
        console.log('========');
        console.log(res);
        console.log();
        // **
        // * create __some_app.css
        // **
        cb(null, file);
    }, function (cb) {
        cb();
    });
}

// Exporting the plugin main function
module.exports = gulp_override;
