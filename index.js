// var buffer = require('vinyl-buffer'),
//     map = require('vinyl-map'),
//     source = require('vinyl-source-stream'),
//     vinylPaths = require('vinyl-paths');

// var _ = require("underscore");
// var through = require('through2');
var path = require('path');
var globby = require("globby");
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-override';


var GulpOverride = function (options) {
    if (!options.directories) {
        throw new PluginError(PLUGIN_NAME, 'Missing "directories" argument!');
    }
    if (!options.type) {
        throw new PluginError(PLUGIN_NAME, 'Missing "type" argument!');
    }
    if (!(this instanceof GulpOverride)) {
        return new GulpOverride(options);
    }
    this.options = options;
    this.files = {};
};


GulpOverride.prototype._clean_files = function(files_list, app_name) {
    return files_list.map(function (path) {
        var path_list = path.split('/');
        return app_name + '/' + path_list[path_list.length-1];
    });
};


GulpOverride.prototype.get_files = function() {
    // var files_pattern = '**/*.' + options.type;
    // var ignore_pattern = '**/'+ options.ignore + '/';
    // return globby.sync([folder + files_pattern,
    //                     '!' + folder + ignore_pattern + files_pattern]);

    var files = {};
    var check_list = [];
    var files_pattern = '/**/*.' + this.options.type;
    var directories = this.options.directories;
    var self = this;

    for (var i in directories) {
        globby.sync(directories[i] + '/*/').forEach(function(folder) {
            var appName = folder.match(/.+\/(.+)\/$/)[1];
            var module_files = globby.sync([directories[i] + appName + files_pattern]);
            var clean_module_files = self._clean_files(module_files, appName);

            if(!(appName in files)){
                files[appName] = [];
            }

            for (var j in clean_module_files) {
                if (check_list.indexOf(clean_module_files[j]) < 0) {
                    files[appName].push(module_files[j]);
                    check_list.push(clean_module_files[j]);
                }
            }
        });
    }

    console.log('========');
    console.log(files);
    console.log();
    this.files = files;
    return files;
};


GulpOverride.prototype.get_dest = function(key) {
    // this.options.directories[0] + key + '/' + this.options.type + '/';
    if (key === undefined) {
        throw new PluginError(PLUGIN_NAME, 'Missing "key" argument!');
    }
    return './tst_res/' + key + '/' + this.options.type + '/';
};


GulpOverride.prototype.get_target = function(key) {
    if (key === undefined) {
        throw new PluginError(PLUGIN_NAME, 'Missing "key" argument!');
    }
    return '__' + key + '.' + this.options.type;
};


module.exports = GulpOverride;
