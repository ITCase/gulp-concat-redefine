var globby = require("globby"),
    // path = require("path"),
    gutil = require('gulp-util'),
    PluginError = gutil.PluginError;
    _ = require('lodash');

var PLUGIN_NAME = 'gulp-concat-redefine',
    check_list = [];


function _check_options(opts) {
    if (!opts.directories) throw new PluginError(PLUGIN_NAME, 'Missing "directories" argument!');
    else if (!Array.isArray(opts.directories)) throw new PluginError(PLUGIN_NAME, '"directories" should be Array');

    if (!opts.type) throw new PluginError(PLUGIN_NAME, 'Missing "type" argument!');
    else if (typeof opts.type !== 'string') throw new PluginError(PLUGIN_NAME, '"type" should be String');

    if (!opts.modules_dir) opts.modules_dir = _.last(opts.directories);
    else if (typeof opts.modules_dir !== 'string') throw new PluginError(PLUGIN_NAME, '"modules_dir" should be String');
    else if (!(opts.modules_dir in opts.directories)) opts.directories.push(opts.modules_dir);

    if (!('corm' in opts)) opts.corm = true;

    if (!opts.ignore_dirs) opts.ignore_dirs = ['node_modules', 'bower_components'];
    else if (!Array.isArray(opts.ignore_dirs)) throw new PluginError(PLUGIN_NAME, '"ignore_dirs" should be Array');

    if (!opts.ignore_modules) opts.ignore_modules = [];
    else if (!Array.isArray(opts.ignore_modules)) throw new PluginError(PLUGIN_NAME, '"ignore_modules" should be Array');

    if (!opts.modules_prefix) opts.modules_prefix = [''];
    else if (typeof opts.modules_prefix === 'string') opts.modules_prefix = [opts.modules_prefix];

    if (!opts.target_prefix) opts.target_prefix = '__';
    else if (typeof opts.target_prefix !== 'string') throw new PluginError(PLUGIN_NAME, '"target_prefix" should be String');

    return opts;
}


var ConcatRedefine = function (opts) {
    if (!(this instanceof ConcatRedefine)) return new ConcatRedefine(opts);
    this.opts = _check_options(opts);
    this.files = {};
    this.get_files();
    // var dirs = this.opts.directories;
    // for (var i in dirs) this._get_files(dirs[i]);
    // check_list = [];
};


function _clean_files(files_list, app_name) {
    return _.map(files_list, function (file_path) {
        var path_list = file_path.split('/');
        return app_name + '/' + _.drop(path_list, path_list.length-2).join('/');
    });
}


// Make function without loop
ConcatRedefine.prototype._get_files = function(dir, get_modules) {
    var self = this;
    var type = this.opts.type;
    var ignore_dirs = this.opts.ignore_dirs;
    var files_pattern = '/**/*.' + type;
    var ignore_pattern = '/**/' + this.opts.target_prefix + '*.*';

    globby.sync(dir + '/*/').forEach(function(folder) {
        var appName = folder.match(/.+\/(.+)\/$/)[1];
        var patterns = [dir+appName+files_pattern, '!'+dir+appName+ignore_pattern];
        for (var i in ignore_dirs) patterns.push('!'+dir+'**/'+ignore_dirs[i]+'/**');

        if (dir == self.opts.modules_dir) {
            if (self.opts.ignore_modules.indexOf(appName) + 1) return;
            for (i in self.opts.modules_prefix) appName = appName.replace(self.opts.modules_prefix[i], '');
            if (self.opts.corm && !(appName in self.files)) return;
        }

        var module_files = globby.sync(patterns);
        var clean_module_files = _clean_files(module_files, appName);

        if (!module_files.length) return;
        if (appName == type) appName = 'main';
        if (!(appName in self.files)) self.files[appName] = [];

        for (i in clean_module_files) {
            if (check_list.indexOf(clean_module_files[i]) + 1 === 0) {
                self.files[appName].push(module_files[i]);
                check_list.push(clean_module_files[i]);
            }
        }
    });
};


ConcatRedefine.prototype.get_files = function() {
    var dirs = this.opts.directories;
    for (var i in dirs) this._get_files(dirs[i]);
    check_list = [];
    return this.files;
};


ConcatRedefine.prototype.get_all_files = function() {
    return _.flattenDeep(_.values(this.files));
};


ConcatRedefine.prototype._get_default_dest = function(dirs, first_file) {
    for (var i in dirs) {
        if (first_file.indexOf(dirs[i]) + 1) return dirs[i];
        else if (first_file.indexOf(this.opts.modules_dir) + 1) return this.opts.modules_dir;
    }
    return dirs[0];
};


ConcatRedefine.prototype.get_dest = function(key) {
    if (key === undefined) throw new PluginError(PLUGIN_NAME, 'Missing "key" argument!');
    var files = this.files[key];
    var dest = this._get_default_dest(this.opts.directories, files[0]);
    var type = this.opts.type;

    // if (files.length) {}
    var dest_dir = files[0].split('/');
    if (dest_dir.indexOf(type) + 1) {
        while (type != dest_dir[dest_dir.length-1]) dest_dir.pop();
        dest = dest_dir.join('/') + '/';
    } else {
        dest = dest + key + '/'; // + type + '/'; create a type dir?
    }
    return dest;
};


ConcatRedefine.prototype.get_target = function(key) {
    if (key === undefined) throw new PluginError(PLUGIN_NAME, 'Missing "key" argument!');
    return this.opts.target_prefix + key + '.' + this.opts.type;
};


ConcatRedefine.prototype.get_all_targets = function() {
    var self = this;
    return _.map(_.keys(this.files), function (key) { return self.get_dest(key) + self.get_target(key); });
};


ConcatRedefine.prototype.get_watch_patterns = function() {
    // function convertPath(f) { return path.dirname(f) + '/**/*.' + type; }
    // _.uniq(_.map(this.get_all_files(), convertPath));
    var type = this.opts.type;
    var md = this.opts.modules_dir;
    var ignore_dirs = this.opts.ignore_dirs;
    var dirs = this.opts.directories;
    if (dirs.indexOf(md) + 1 === 0) dirs.push(md);
    var patterns = _.map(dirs, function(p) { return p+'**/*.'+type; }).concat(['!**/__*.'+type, '!'+md+'**/__*.'+type]);
    for (var i in ignore_dirs) patterns = patterns.concat(['!**/'+ignore_dirs[i]+'/**', '!'+md+'**/'+ignore_dirs[i]+'/**']);
    return patterns;
};

module.exports = ConcatRedefine;
