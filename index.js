'use strict'

const _ = require('lodash')
const globby = require('globby')
const gutil = require('gulp-util')
const PlError = gutil.PluginError

const PLUGIN_NAME = 'gulp-concat-redefine'
let _checkList = []

function _checkOptions(opts) {
  opts = opts || {}

  if (!opts.directories) {
    throw new PlError(PLUGIN_NAME, 'Missing "directories" option')
  } else if (!Array.isArray(opts.directories)) {
    throw new PlError(PLUGIN_NAME, '"directories" should be Array')
  }

  if (!opts.type) {
    throw new PlError(PLUGIN_NAME, 'Missing "type" option')
  } else if (typeof opts.type !== 'string') {
    throw new PlError(PLUGIN_NAME, '"type" should be String')
  }

  if (!opts.modules_dir) {
    opts.modules_dir = _.last(opts.directories)
  } else if (typeof opts.modules_dir !== 'string') {
    throw new PlError(PLUGIN_NAME, '"modules_dir" should be String')
  } else if (!(opts.modules_dir in opts.directories)) {
    opts.directories.push(opts.modules_dir)
  }

  if (!('corm' in opts)) {
    opts.corm = true // collect only redefined modules
  }

  if (!opts.ignoreDirs) {
    opts.ignoreDirs = ['node_modules', 'bower_components', 'tests', 'vendor']
  } else if (!Array.isArray(opts.ignoreDirs)) {
    throw new PlError(PLUGIN_NAME, '"ignoreDirs" should be Array')
  }

  if (!opts.ignore_modules) {
    opts.ignore_modules = []
  } else if (!Array.isArray(opts.ignore_modules)) {
    throw new PlError(PLUGIN_NAME, '"ignore_modules" should be Array')
  }

  if (!opts.modulesPrefix) {
    opts.modulesPrefix = ['']
  } else if (typeof opts.modulesPrefix === 'string') {
    opts.modulesPrefix = [opts.modulesPrefix]
  } else if (!Array.isArray(opts.modulesPrefix)) {
    throw new PlError(PLUGIN_NAME, '"modulesPrefix" should be String or Array')
  }

  if (!opts.target_prefix) {
    opts.target_prefix = '__'
  } else if (typeof opts.target_prefix !== 'string') {
    throw new PlError(PLUGIN_NAME, '"target_prefix" should be String')
  }

  return opts
}

const ConcatRedefine = function (opts, collectFiles) {
  if (!(this instanceof ConcatRedefine)) {
    return new ConcatRedefine(opts)
  }
  this.opts = _checkOptions(opts)
  if (collectFiles) {
    this.get_files()
  }
}

function _cleanFiles(filesList, appName) {
  return _.map(filesList, (filePath) => {
    const pathList = filePath.split('/')
    return appName + '/' + _.drop(pathList, pathList.length - 2).join('/')
  })
}

ConcatRedefine.prototype._get_files = function (dir) {
  const type = this.opts.type
  const ignoreDirs = this.opts.ignoreDirs
  const filesPattern = '/**/*.' + type
  const ignorePattern = '/**/' + this.opts.target_prefix + '*.*'
  const modulesPrefix = this.opts.modulesPrefix

  if (!_.endsWith(dir, '/')) {
    dir += '/'
  }

  globby.sync(dir + '*/').forEach(
    function (folder) {
      let appName = folder.match(/.+\/(.+)\/$/)[1]
      const patterns = [dir + appName + filesPattern, '!' + dir + appName + ignorePattern]

      for (const i in ignoreDirs) {
        patterns.push('!' + dir + '**/' + ignoreDirs[i] + '/**')
      }

      if (dir === this.opts.modules_dir) {
        if (this.opts.ignore_modules.indexOf(appName) + 1) {
          return
        }

        // TODO: this ugly
        let isModule = false
        for (const i in modulesPrefix) {
          if (appName.indexOf(modulesPrefix[i]) + 1) {
            isModule = true
            break
          }
        }
        if (!isModule) {
          return
        }
        // -----

        for (const i in modulesPrefix) {
          appName = appName.replace(modulesPrefix[i], '')
        }
        if (this.opts.corm && !(appName in this.files)) {
          return
        }
      } else {
        for (const i in modulesPrefix) {
          appName = appName.replace(modulesPrefix[i], '')
        }
      }

      const moduleFiles = globby.sync(patterns)
      const cleanModuleFiles = _cleanFiles(moduleFiles, appName)

      if (!moduleFiles.length) {
        return
      }
      if (appName === type) {
        appName = 'main'
      }
      if (!Array.isArray(this.files[appName])) {
        this.files[appName] = []
      }

      for (const i in cleanModuleFiles) {
        if (_checkList.indexOf(cleanModuleFiles[i]) + 1 === 0) {
          this.files[appName].push(moduleFiles[i])
          _checkList.push(cleanModuleFiles[i])
        }
      }
    }.bind(this)
  )
}

ConcatRedefine.prototype.get_files = function () {
  this.files = {}
  const dirs = this.opts.directories
  for (const i in dirs) {
    this._get_files(dirs[i])
  }
  _checkList = []
  return this.files
}

ConcatRedefine.prototype.get_all_files = function () {
  return _.flattenDeep(_.values(this.files))
}

ConcatRedefine.prototype._get_default_dest = function (dirs, firstFile) {
  for (const i in dirs) {
    if (firstFile.indexOf(dirs[i]) + 1) return dirs[i]
    else if (firstFile.indexOf(this.opts.modules_dir) + 1) return this.opts.modules_dir
  }
  return dirs[0]
}

ConcatRedefine.prototype.get_dest = function (key) {
  if (key === undefined) {
    throw new PlError(PLUGIN_NAME, 'Missing "key" argument!')
  }
  const files = this.files[key]
  let dest = this._get_default_dest(this.opts.directories, files[0])
  const type = this.opts.type

  // if (files.length) {}
  const destDirectory = files[0].split('/')
  if (destDirectory.indexOf(type) + 1) {
    while (type !== destDirectory[destDirectory.length - 1]) destDirectory.pop()
    dest = destDirectory.join('/') + '/'
  } else {
    dest = dest + key + '/' // create a type dir?
  }
  return dest
}

ConcatRedefine.prototype.get_target = function (key) {
  if (key === undefined) {
    throw new PlError(PLUGIN_NAME, 'Missing "key" argument!')
  }
  return this.opts.target_prefix + key + '.' + this.opts.type
}

ConcatRedefine.prototype.get_all_targets = function () {
  return _.map(
    _.keys(this.files),
    function (key) {
      return this.get_dest(key) + this.get_target(key)
    },
    this
  )
}

// TODO: make ignore patterns for all directories(personaly)
ConcatRedefine.prototype.get_watch_patterns = function () {
  const type = this.opts.type
  const md = this.opts.modules_dir
  const ignoreDirs = this.opts.ignoreDirs
  const dirs = this.opts.directories.slice()
  const modulesPrefixes = this.opts.modulesPrefix

  if (dirs.indexOf(md) + 1) {
    // dirs.push(md)
    dirs.splice(dirs.indexOf(md), 1)
  }
  let patterns = _.map(dirs, (p) => {
    return p + '**/*.' + type
  })

  const modulesPatterns = []
  for (const i in modulesPrefixes) {
    modulesPatterns.push(md + modulesPrefixes[i] + '*/**/*.' + type)
    modulesPatterns.push(md + modulesPrefixes[i] + '*/*.' + type)
  }
  patterns = patterns.concat(modulesPatterns)
  patterns = patterns.concat(['!**/__*.' + type, '!' + md + '**/__*.' + type])

  for (const i in ignoreDirs) {
    patterns = patterns.concat([
      '!**/' + ignoreDirs[i] + '/**',
      '!' + md + '**/' + ignoreDirs[i] + '/**',
    ])
  }
  return patterns
}

ConcatRedefine.prototype.get_app_by_path = function (path) {
  const modulesPrefixes = this.opts.modulesPrefix
  const pathList = _.map(path.split('/'), function (item) {
    for (const i in modulesPrefixes) {
      item = item.replace(modulesPrefixes[i], '')
    }
    return item
  })
  for (const i in pathList) {
    let appName = pathList[i]
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
