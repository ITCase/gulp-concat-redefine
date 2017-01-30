'use strict'

var _ = require('lodash')
var globby = require('globby')
var gutil = require('gulp-util')
var PlError = gutil.PluginError

var PL_NAME = 'gulp-concat-redefine'
var _check_list = []

function _check_options (opts) {
  opts = opts || {}

  if (!opts.directories) {
    throw new PlError(PL_NAME, 'Missing "directories" option')
  } else if (!Array.isArray(opts.directories)) {
    throw new PlError(PL_NAME, '"directories" should be Array')
  }

  if (!opts.type) {
    throw new PlError(PL_NAME, 'Missing "type" option')
  } else if (typeof opts.type !== 'string') {
    throw new PlError(PL_NAME, '"type" should be String')
  }

  if (!opts.modules_dir) {
    opts.modules_dir = _.last(opts.directories)
  } else if (typeof opts.modules_dir !== 'string') {
    throw new PlError(PL_NAME, '"modules_dir" should be String')
  } else if (!(opts.modules_dir in opts.directories)) {
    opts.directories.push(opts.modules_dir)
  }

  if (!('corm' in opts)) {
    opts.corm = true // collect only redefined modules
  }

  if (!opts.ignore_dirs) {
    opts.ignore_dirs = ['node_modules', 'bower_components', 'tests', 'vendor']
  } else if (!Array.isArray(opts.ignore_dirs)) {
    throw new PlError(PL_NAME, '"ignore_dirs" should be Array')
  }

  if (!opts.ignore_modules) {
    opts.ignore_modules = []
  } else if (!Array.isArray(opts.ignore_modules)) {
    throw new PlError(PL_NAME, '"ignore_modules" should be Array')
  }

  if (!opts.modules_prefix) {
    opts.modules_prefix = ['']
  } else if (typeof opts.modules_prefix === 'string') {
    opts.modules_prefix = [opts.modules_prefix]
  } else if (!Array.isArray(opts.modules_prefix)) {
    throw new PlError(PL_NAME, '"modules_prefix" should be String or Array')
  }

  if (!opts.target_prefix) {
    opts.target_prefix = '__'
  } else if (typeof opts.target_prefix !== 'string') {
    throw new PlError(PL_NAME, '"target_prefix" should be String')
  }

  return opts
}

var ConcatRedefine = function (opts, collect_files) {
  if (!(this instanceof ConcatRedefine)) {
    return new ConcatRedefine(opts)
  }
  this.opts = _check_options(opts)
  if (collect_files) {
    this.get_files()
  }
}

function _clean_files (files_list, app_name) {
  return _.map(files_list, function (file_path) {
    var path_list = file_path.split('/')
    return app_name + '/' + _.drop(path_list, path_list.length - 2).join('/')
  })
}

ConcatRedefine.prototype._get_files = function (dir) {
  var type = this.opts.type
  var ignore_dirs = this.opts.ignore_dirs
  var files_pattern = '/**/*.' + type
  var ignore_pattern = '/**/' + this.opts.target_prefix + '*.*'
  var modules_prefix = this.opts.modules_prefix

  if (!(_.endsWith(dir, '/'))) {
    dir += '/'
  }

  globby.sync(dir + '*/').forEach(function (folder) {
    var appName = folder.match(/.+\/(.+)\/$/)[1]
    var patterns = [
      dir + appName + files_pattern,
      '!' + dir + appName + ignore_pattern
    ]

    for (var i in ignore_dirs) {
      patterns.push('!' + dir + '**/' + ignore_dirs[i] + '/**')
    }

    if (dir === this.opts.modules_dir) {
      if (this.opts.ignore_modules.indexOf(appName) + 1) {
        return
      }

      // TODO: this ugly
      var is_module = false
      for (i in modules_prefix) {
        if (appName.indexOf(modules_prefix[i]) + 1) {
          is_module = true
          break
        }
      }
      if (!(is_module)) {
        return
      }
      // -----

      for (i in modules_prefix) {
        appName = appName.replace(modules_prefix[i], '')
      }
      if (this.opts.corm && !(appName in this.files)) {
        return
      }
    } else {
      for (i in modules_prefix) {
        appName = appName.replace(modules_prefix[i], '')
      }
    }

    var module_files = globby.sync(patterns)
    var clean_module_files = _clean_files(module_files, appName)

    if (!module_files.length) {
      return
    }
    if (appName === type) {
      appName = 'main'
    }
    if (!(appName in this.files)) {
      this.files[appName] = []
    }

    for (i in clean_module_files) {
      if (_check_list.indexOf(clean_module_files[i]) + 1 === 0) {
        this.files[appName].push(module_files[i])
        _check_list.push(clean_module_files[i])
      }
    }
  }.bind(this))
}

ConcatRedefine.prototype.get_files = function () {
  this.files = {}
  var dirs = this.opts.directories
  for (var i in dirs) {
    this._get_files(dirs[i])
  }
  _check_list = []
  return this.files
}

ConcatRedefine.prototype.get_all_files = function () {
  return _.flattenDeep(_.values(this.files))
}

ConcatRedefine.prototype._get_default_dest = function (dirs, first_file) {
  for (var i in dirs) {
    if (first_file.indexOf(dirs[i]) + 1) return dirs[i]
    else if (first_file.indexOf(this.opts.modules_dir) + 1) return this.opts.modules_dir
  }
  return dirs[0]
}

ConcatRedefine.prototype.get_dest = function (key) {
  if (key === undefined) {
    throw new PlError(PL_NAME, 'Missing "key" argument!')
  }
  var files = this.files[key]
  var dest = this._get_default_dest(this.opts.directories, files[0])
  var type = this.opts.type

  // if (files.length) {}
  var dest_dir = files[0].split('/')
  if (dest_dir.indexOf(type) + 1) {
    while (type !== dest_dir[dest_dir.length - 1]) dest_dir.pop()
    dest = dest_dir.join('/') + '/'
  } else {
    dest = dest + key + '/' // create a type dir?
  }
  return dest
}

ConcatRedefine.prototype.get_target = function (key) {
  if (key === undefined) {
    throw new PlError(PL_NAME, 'Missing "key" argument!')
  }
  return this.opts.target_prefix + key + '.' + this.opts.type
}

ConcatRedefine.prototype.get_all_targets = function () {
  return _.map(_.keys(this.files), function (key) {
    return this.get_dest(key) + this.get_target(key)
  }, this)
}

// TODO: make ignore patterns for all directories(personaly)
ConcatRedefine.prototype.get_watch_patterns = function () {
  var type = this.opts.type
  var md = this.opts.modules_dir
  var ignore_dirs = this.opts.ignore_dirs
  var dirs = this.opts.directories.slice()
  var modules_prefixes = this.opts.modules_prefix

  if (dirs.indexOf(md) + 1) {
    // dirs.push(md)
    dirs.splice(dirs.indexOf(md), 1)
  }
  var patterns = _.map(dirs, function (p) {
    return p + '**/*.' + type
  })

  var modules_patterns = []
  for (var i in modules_prefixes) {
    modules_patterns.push(md + modules_prefixes[i] + '*/**/*.' + type)
    modules_patterns.push(md + modules_prefixes[i] + '*/*.' + type)
  }
  patterns = patterns.concat(modules_patterns)
  patterns = patterns.concat([
    '!**/__*.' + type,
    '!' + md + '**/__*.' + type
  ])

  for (i in ignore_dirs) {
    patterns = patterns.concat([
      '!**/' + ignore_dirs[i] + '/**',
      '!' + md + '**/' + ignore_dirs[i] + '/**'])
  }
  return patterns
}

ConcatRedefine.prototype.get_app_by_path = function (path) {
  var modules_prefixes = this.opts.modules_prefix
  var path_list = _.map(path.split('/'), function (item) {
    for (var i in modules_prefixes) {
      item = item.replace(modules_prefixes[i], '')
    }
    return item
  })
  for (var i in path_list) {
    var appName = path_list[i]
    if (appName === this.opts.type) {
      appName = 'main'
    }
    if (appName in this.files) {
      return appName
    }
  }
  return false
}

module.exports = ConcatRedefine
