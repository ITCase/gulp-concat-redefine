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
    this.prefix = '__';
    this.files = {};
    this.check_list = [];
};


GulpOverride.prototype._clean_files = function(files_list, app_name) {
    return files_list.map(function (path) {
        var path_list = path.split('/');
        return app_name + '/' + path_list[path_list.length-1];
    });
};


// Make function without loop
GulpOverride.prototype._get_files = function(dir) {
    var self = this;
    var files_pattern = '/**/*.' + self.options.type;
    var ignore_pattern = '/**/' + this.prefix + '*.*';

    globby.sync(dir + '/*/').forEach(function(folder) {
        var appName = folder.match(/.+\/(.+)\/$/)[1];
        var module_files = globby.sync([dir + appName + files_pattern,
                                        '!' + dir + appName + ignore_pattern]);
        var clean_module_files = self._clean_files(module_files, appName);

        if(!(appName in self.files)){
            self.files[appName] = [];
        }

        for (var j in clean_module_files) {
            if (self.check_list.indexOf(clean_module_files[j]) < 0) {
                self.files[appName].push(module_files[j]);
                self.check_list.push(clean_module_files[j]);
            }
        }
    });
};


GulpOverride.prototype.get_files = function() {
    var dirs = this.options.directories;
    for (var i in dirs) this._get_files(dirs[i]);
    this.check_list = [];
    return this.files;
};


GulpOverride.prototype.get_dest = function(key) {
    if (key === undefined) {
        throw new PluginError(PLUGIN_NAME, 'Missing "key" argument!');
    }
    var app_files = this.files[key];
    var dest = this.options.directories[0];
    var type = this.options.type;

    if (app_files.length) {
        var dest_dir = app_files[0].split('/');
        if (dest_dir.indexOf(type) + 1) {
            while (type != dest_dir[dest_dir.length-1]) {
                dest_dir.pop();
            }
            dest = dest_dir.join('/') + '/';
        } else {
            dest = dest + key + '/' + type + '/';
        }
    }
    return dest;
};


GulpOverride.prototype.get_target = function(key) {
    if (key === undefined) {
        throw new PluginError(PLUGIN_NAME, 'Missing "key" argument!');
    }
    return this.prefix + key + '.' + this.options.type;
};


module.exports = GulpOverride;
