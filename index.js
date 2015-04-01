var globby = require("globby"),
    // path = require("path"),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError;
    _ = require('lodash');

var PLUGIN_NAME = 'gulp-concat-redefine',
    check_list = [];

var ConcatRedefine = function (options) {
    if (!(this instanceof ConcatRedefine)) return new ConcatRedefine(options);

    this.options = this._check_options(options);
    this.modules_list = [];
    this.files = {};

    // TODO: refactoring
    // TODO2: when file created/deleted, it must be added/removed to files list

    // from main dirs
    var dirs = this.options.directories;
    for (var i in dirs) this._get_files(dirs[i], true);
    // from modules dirs
    var modules = this.modules_list;
    for (i in modules) this._get_files(modules[i], false);
    check_list = [];
};


ConcatRedefine.prototype._check_options = function(options) {
    if (!options.directories) throw new PluginError(PLUGIN_NAME, 'Missing "directories" argument!');
    else if (!Array.isArray(options.directories)) throw new PluginError(PLUGIN_NAME, '"directories" should be Array');

    if (!options.type) throw new PluginError(PLUGIN_NAME, 'Missing "type" argument!');
    else if (typeof options.type !== 'string') throw new PluginError(PLUGIN_NAME, '"type" should be String');

    if (!options.ignore_dirs) options.ignore_dirs = ['node_modules', 'bower_components'];
    else if (!Array.isArray(options.ignore_dirs)) throw new PluginError(PLUGIN_NAME, '"ignore_dirs" should be Array');

    if (!options.ignore_modules) options.ignore_modules = [];
    else if (!Array.isArray(options.ignore_modules)) throw new PluginError(PLUGIN_NAME, '"ignore_modules" should be Array');

    if (!options.target_prefix) options.target_prefix = '__';
    else if (typeof options.target_prefix !== 'string') throw new PluginError(PLUGIN_NAME, '"target_prefix" should be String');

    return options;
};

ConcatRedefine.prototype._clean_files = function(files_list, app_name) {
    return _.map(files_list, function (file_path) {
        var path_list = file_path.split('/');
        return app_name + '/' + _.drop(path_list, path_list.length-2).join('/');
    });
};


// Make function without loop
ConcatRedefine.prototype._get_files = function(dir, get_modules) {
    var self = this;
    var type = self.options.type;
    var ignore_dirs = self.options.ignore_dirs;
    var files_pattern = '/**/*.' + type;
    var ignore_pattern = '/**/' + this.options.target_prefix + '*.*';

    globby.sync(dir + '/*/').forEach(function(folder) {
        var appName = folder.match(/.+\/(.+)\/$/)[1];
        var pattern = [dir + appName + files_pattern, '!' + dir + appName + ignore_pattern];
        for (var i in ignore_dirs) pattern.push('!'+dir+'**/'+ignore_dirs[i]+'/**');
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

        if (get_modules && self.options.modules_dir) {
            globby.sync(self.options.modules_dir + '/*/').forEach(function(folder) {
                var moduleName = folder.match(/.+\/(.+)\/$/)[1];
                if (self.options.ignore_modules.indexOf(moduleName) + 1) return;
                if (moduleName.indexOf(appName) + 1 && self.modules_list.indexOf(folder) < 0) {
                    self.modules_list.push(folder);
                }
            });
        }
    });
};


ConcatRedefine.prototype.get_files = function() {
    // // from main dirs
    // var dirs = this.options.directories;
    // for (var i in dirs) this._get_files(dirs[i], true);
    // // from modules dirs
    // var modules = this.modules_list;
    // for (i in modules) this._get_files(modules[i], false);
    // check_list = [];
    return this.files;
};


ConcatRedefine.prototype.get_all_files = function() {
    return _.flattenDeep(_.values(this.files));
};


ConcatRedefine.prototype._get_default_dest = function(dirs, first_file) {
    for (var i in dirs) {
        if (first_file.indexOf(dirs[i]) >= 0) return dirs[i];
        else if (first_file.indexOf(this.options.modules_dir) >= 0) return this.options.modules_dir;
    }
    return dirs[0];
};


ConcatRedefine.prototype.get_dest = function(key) {
    if (key === undefined) throw new PluginError(PLUGIN_NAME, 'Missing "key" argument!');
    var files = this.files[key];
    var dest = this._get_default_dest(this.options.directories, files[0]);
    var type = this.options.type;

    if (files.length) {
        var dest_dir = files[0].split('/');
        if (dest_dir.indexOf(type) + 1) {
            while (type != dest_dir[dest_dir.length-1]) dest_dir.pop();
            dest = dest_dir.join('/') + '/';
        } else {
            dest = dest + key + '/'; // + type + '/'; create a type dir?
        }
    }
    return dest;
};


ConcatRedefine.prototype.get_target = function(key) {
    if (key === undefined) throw new PluginError(PLUGIN_NAME, 'Missing "key" argument!');
    return this.options.target_prefix + key + '.' + this.options.type;
};


ConcatRedefine.prototype.get_all_targets = function() {
    var self = this;
    return _.map(_.keys(this.files), function (key) { return self.get_dest(key) + self.get_target(key); });
};


ConcatRedefine.prototype.get_watch_patterns = function() {
    // function convertPath(f) { return path.dirname(f) + '/**/*.' + type; }
    // _.uniq(_.map(this.get_all_files(), convertPath));
    var type = this.options.type;
    var dirs = this.options.directories;
    var ignores = ['!**/__*.' + type];

    if (this.options.modules_dir) {
        dirs.push(this.options.modules_dir);
        ignores.push('!' + this.options.modules_dir + '**/__*.' + type);
    }
    return _.map(dirs, function(p) { return p + '**/*.' + type; }).concat(ignores);
};

module.exports = ConcatRedefine;
