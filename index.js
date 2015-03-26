'use strict';

var path = require('path'),
    globby = require("globby"),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-concat-redefine';
var check_list = [];

var ConcatRedefine = function (options) {
    if (!options.directories) {
        throw new PluginError(PLUGIN_NAME, 'Missing "directories" argument!');
    }
    if (!options.type) {
        throw new PluginError(PLUGIN_NAME, 'Missing "type" argument!');
    }
    if (!(this instanceof ConcatRedefine)) {
        return new ConcatRedefine(options);
    }

    if (!options.ignore_default) options.ignore_default = ['node_modules', 'bower_components'];
    if (!options.ignore_dir) options.ignore_dir = [];
    if (!options.target_prefix) options.target_prefix = '__';

    this.options = options;
    this.modules_list = [];
    this.files = {};
};


ConcatRedefine.prototype._clean_files = function(files_list, app_name) {
    return files_list.map(function (file_path) {
        var path_list = file_path.split('/');
        return app_name + '/' + path_list[path_list.length-1];
    });
};


// Make function without loop
ConcatRedefine.prototype._get_files = function(dir, get_modules) {
    var self = this;
    var type = self.options.type;
    var ignore_default = self.options.ignore_default;
    var files_pattern = '/**/*.' + type;
    var ignore_pattern = '/**/' + this.options.target_prefix + '*.*';

    globby.sync(dir + '/*/').forEach(function(folder) {
        var appName = folder.match(/.+\/(.+)\/$/)[1];
        var pattern = [dir+appName+files_pattern, '!'+dir+appName+ignore_pattern];
        for (var i in ignore_default) pattern.push('!'+dir+'**/'+ignore_default[i]+'/**');
        var module_files = globby.sync(pattern);
        var clean_module_files = self._clean_files(module_files, appName);

        if (!module_files.length) return;
        if (appName == type) appName = 'main';
        if (!(appName in self.files)) self.files[appName] = [];

        for (i in clean_module_files) {
            if (check_list.indexOf(clean_module_files[i]) < 0) {
                self.files[appName].push(module_files[i]);
                check_list.push(clean_module_files[i]);
            }
        }

        if (get_modules) {
            globby.sync(self.options.modules_dir + '/*/').forEach(function(folder) {
                var moduleName = folder.match(/.+\/(.+)\/$/)[1];
                if (self.options.ignore_dir.indexOf(moduleName) + 1) return;
                if (moduleName.indexOf(appName) + 1 && self.modules_list.indexOf(folder) < 0) {
                    self.modules_list.push(folder);
                }
            });
        }
    });
};


ConcatRedefine.prototype.get_files = function() {
    // from main dirs
    var dirs = this.options.directories;
    for (var i in dirs) this._get_files(dirs[i], true);
    // from modules dirs
    var modules = this.modules_list;
    for (i in modules) this._get_files(modules[i], false);
    check_list = [];
    return this.files;
};


ConcatRedefine.prototype.get_dest = function(key) {
    if (key === undefined) {
        throw new PluginError(PLUGIN_NAME, 'Missing "key" argument!');
    }
    var files = this.files[key];
    var dest = this.options.directories[0];
    var type = this.options.type;

    if (files.length) {
        var dest_dir = files[0].split('/');
        if (dest_dir.indexOf(type) + 1) {
            while (type != dest_dir[dest_dir.length-1]) dest_dir.pop();
            dest = dest_dir.join('/') + '/';
        } else {
            dest = dest + key + '/' + type + '/';
        }
    }
    return dest;
};


ConcatRedefine.prototype.get_target = function(key) {
    if (key === undefined) {
        throw new PluginError(PLUGIN_NAME, 'Missing "key" argument!');
    }
    return this.options.target_prefix + key + '.' + this.options.type;
};


module.exports = ConcatRedefine;