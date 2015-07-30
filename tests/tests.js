'use strict';

var fs = require('fs'),
    assert = require('assert'),
    globby = require('globby'),
    expect = require('chai').expect,
    should = require('chai').should();

var ConcatRedefine = require('../index');
var cr = new ConcatRedefine({
    directories: ['./tests/fixtures/static/',
                  './tests/fixtures/app/',
                  './tests/fixtures/modules/'],
    type: 'css',
    corm: false,
    ignore_dirs: ['ignore-directory'],
    target_prefix: '__'
    // modules_dir: './tests/fixtures/modules/',
    // ignore_modules: [],
    // modules_prefix: 'django-',
});


describe('object opts', function(){
  it('should have opts', function(){
    cr.should.have.property('opts').that.is.a('object');
    cr.should.have.property('files').that.is.a('object');
    cr.opts.should.have.property('directories').that.is.a('array');
    cr.opts.should.have.property('modules_dir').that.is.a('string');
    cr.opts.should.have.property('ignore_dirs').that.is.a('array');
    cr.opts.should.have.property('ignore_modules').that.is.a('array');
    cr.opts.should.have.property('type').that.is.a('string');
    cr.opts.should.have.property('target_prefix').that.is.a('string');
    cr.opts.should.have.property('modules_prefix').that.is.a('array');
    cr.opts.should.have.property('corm').that.is.a('boolean');
  });

  it('should have methods', function(){
    expect(cr).to.respondTo('get_files');
    expect(cr).to.respondTo('get_all_files');
    expect(cr).to.respondTo('get_dest');
    expect(cr).to.respondTo('get_target');
    expect(cr).to.respondTo('get_all_targets');
    expect(cr).to.respondTo('get_watch_patterns');
  });
});


describe('get_files', function(){
  function check_files (files, key, right_files) {
      expect(files).to.have.property(key)
        .that.is.an('array')
        .that.is.to.have.length(right_files.length)
        .that.is.to.eql(right_files);
  }

  it('should find directories and apps', function(){
    cr.opts.directories.should.to.be.a('array').that.length(3);
    var files = cr.get_files();
    expect(files).to.be.a('object');
    expect(files).to.have.keys('app1', 'app2', 'app3', 'app4', 'app5', 'app6');
  });

  it('should get files from "static/app1", "app/app1", "modules/app1" and build in "static/app1"', function(){
    var rf = ['./tests/fixtures/static/app1/app1_file3.css',
              './tests/fixtures/static/app1/app1_file4.css',
              './tests/fixtures/app/app1/app1_file1.css',
              './tests/fixtures/app/app1/app1_file2.css',
              './tests/fixtures/modules/app1/app1_file5.css'];
    check_files(cr.files, 'app1', rf);
  });

  it('should get files from "app/app2" and "modules/app2" and build in "app/app2"', function(){
    var rf = ['./tests/fixtures/app/app2/app2_file1.css',
              './tests/fixtures/modules/app2/app2_file2.css'];
    check_files(cr.files, 'app2', rf);
  });

  it('should get files from "static/app3" and "modules/app3" and build in "static/app3"', function(){
    var rf = ['./tests/fixtures/static/app3/app3_file1.css',
              './tests/fixtures/static/app3/app3_file2.css',
              './tests/fixtures/modules/app3/app3_file3.css'];
    check_files(cr.files, 'app3', rf);
  });

  it('should get files from "app/app4" and build in "app/app4"', function(){
    var rf = ['./tests/fixtures/app/app4/app4_file1.css',
              './tests/fixtures/app/app4/app4_file2.css',
              './tests/fixtures/app/app4/app4_file3.css'];
    check_files(cr.files, 'app4', rf);
  });

  it('should get files from "modules/app5" and build in "modules/app5"', function(){
    var rf = ['./tests/fixtures/modules/app5/app5_file1.css',
              './tests/fixtures/modules/app5/app5_file2.css'];
    check_files(cr.files, 'app5', rf);
  });

  it('should get files from "static/app6" and build in "static/app6"', function(){
    var rf = ['./tests/fixtures/static/app6/app6_file1.css',
              './tests/fixtures/static/app6/app6_file2.css',
              './tests/fixtures/static/app6/app6_file3.css',
              './tests/fixtures/static/app6/app6_file4.css'
        ];
    check_files(cr.files, 'app6', rf);
  });
});


describe('get_dest', function(){
  it('should find destanation directory for every application', function(){
    expect(cr.get_dest('app1')).to.be.a('string').that.equal('./tests/fixtures/static/app1/');
    expect(cr.get_dest('app2')).to.be.a('string').that.equal('./tests/fixtures/app/app2/');
    expect(cr.get_dest('app3')).to.be.a('string').that.equal('./tests/fixtures/static/app3/');
    expect(cr.get_dest('app4')).to.be.a('string').that.equal('./tests/fixtures/app/app4/');
    expect(cr.get_dest('app5')).to.be.a('string').that.equal('./tests/fixtures/modules/app5/');
    expect(cr.get_dest('app6')).to.be.a('string').that.equal('./tests/fixtures/static/app6/');
  });
});


describe('get_target', function(){
  it('should set target file', function(){
    for(var app_name in cr.files) {
      expect(cr.get_target(app_name))
        .to.be.a('string')
        .to.contain(cr.opts.target_prefix)
        .that.contain(app_name)
        .that.contain(cr.opts.type);
    }
  });
});


describe('get_all_files', function(){
  it('should contains all right files with rigth path', function(){
    var all_files = cr.get_all_files();
    var right_all_files = [
        './tests/fixtures/app/app1/app1_file1.css',
        './tests/fixtures/app/app1/app1_file2.css',
        './tests/fixtures/static/app1/app1_file3.css',
        './tests/fixtures/static/app1/app1_file4.css',
        './tests/fixtures/modules/app1/app1_file5.css',
        './tests/fixtures/app/app2/app2_file1.css',
        './tests/fixtures/modules/app2/app2_file2.css',
        './tests/fixtures/static/app3/app3_file1.css',
        './tests/fixtures/static/app3/app3_file2.css',
        './tests/fixtures/modules/app3/app3_file3.css',
        './tests/fixtures/app/app4/app4_file1.css',
        './tests/fixtures/app/app4/app4_file2.css',
        './tests/fixtures/app/app4/app4_file3.css',
        './tests/fixtures/modules/app5/app5_file1.css',
        './tests/fixtures/modules/app5/app5_file2.css',
        './tests/fixtures/static/app6/app6_file1.css',
        './tests/fixtures/static/app6/app6_file2.css',
        './tests/fixtures/static/app6/app6_file3.css',
        './tests/fixtures/static/app6/app6_file4.css'
      ];
    expect(all_files).to.be.a('array').that.length(right_all_files.length);
    right_all_files.forEach(function (f) { expect(all_files).to.contain(f); });
  });
});


describe('get_all_targets', function(){
  it('should set target file', function(){
    // console.error(cr.get_all_targets());
    var all_targets = cr.get_all_targets();
    var right_all_targets = [
        './tests/fixtures/static/app1/__app1.css',
        './tests/fixtures/app/app2/__app2.css',
        './tests/fixtures/static/app3/__app3.css',
        './tests/fixtures/app/app4/__app4.css',
        './tests/fixtures/modules/app5/__app5.css',
        './tests/fixtures/static/app6/__app6.css',
      ];
    expect(all_targets).to.be.a('array').that.length(right_all_targets.length);
    right_all_targets.forEach(function (f) { expect(all_targets).to.contain(f); });

    for(var app_name in cr.files) {
      expect(right_all_targets)
        .to.contain(cr.get_dest(app_name) + cr.get_target(app_name));
    }
  });
});


describe('get_watch_patterns', function(){
  it('should set watch patterns', function(){
    var watch_patterns = cr.get_watch_patterns();
    var right_watch_patterns = [
        './tests/fixtures/static/**/*.css',
        './tests/fixtures/app/**/*.css',
        './tests/fixtures/modules/**/*.css',
        '!**/__*.css',
        '!./tests/fixtures/modules/**/__*.css',
        '!**/ignore-directory/**',
        '!./tests/fixtures/modules/**/ignore-directory/**'
    ];

    expect(watch_patterns).to.be.a('array').that.length(right_watch_patterns.length);
    right_watch_patterns.forEach(function (f) { expect(watch_patterns).to.contain(f); });
  });
});