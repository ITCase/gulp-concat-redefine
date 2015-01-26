// var buffer = require('vinyl-buffer'),
//     map = require('vinyl-map'),
//     source = require('vinyl-source-stream'),
//     vinylPaths = require('vinyl-paths');

var _ = require("underscore"),
    glob = require("glob"),
    minimatch = require("minimatch");

var path = require('path');

var through = require('through2');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;


// Consts
var PLUGIN_NAME = 'gulp-override';

module.exports = function (options) {
    options = options || {};

    return through.obj(function (file, enc, cb) {

        console.log(file);
        // Find folders in project apps and static paths
        var filepath = file.path;
        var cwd = file.cwd;
        var relative = path.relative(cwd, filepath);

        var appList = glob.sync(relative + '/*/');
        var list = [];

        appList.forEach(function(folder) {
            appName = folder.match(/.+\/(.+)\/$/)[1];
            list.push(appName);
        });

        list = _.uniq(list);

    }, function (cb) {
        cb();
    });
};