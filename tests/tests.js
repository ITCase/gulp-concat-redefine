'use strict';

var fs = require('fs'),
    assert = require('assert'),
    globby = require("globby"),
    expect = require('chai').expect,
    should = require('chai').should();

var ConcatRedefine = require('../index');

var options = {
    directories: [
        './tests/fixtures/static/',
        './tests/fixtures/app/',
        './tests/fixtures/modules/',
    ],
    modules_dir: 'itcase-dev',
    ignore_dir: ['ignore-directory'],
    type: 'css',
    target_prefix: '__'
};

var go = new ConcatRedefine(options);

describe('object options', function(){
    it('should have options', function(){
        go.should.have.property('options').that.is.a('object');
        go.should.have.property('modules_list').that.is.a('array');
        go.should.have.property('files').that.is.a('object');
        go.options.should.have.property('directories').that.is.a('array');
        go.options.should.have.property('modules_dir').that.is.a('string');
        go.options.should.have.property('ignore_dir').that.is.a('array');
        go.options.should.have.property('type').that.is.a('string');
        go.options.should.have.property('ignore_default').that.is.a('array');
        go.options.should.have.property('target_prefix').that.is.a('string');
    });

    it('should have methods', function(){
        expect(go).to.respondTo('_clean_files');
        expect(go).to.respondTo('_get_files');
        expect(go).to.respondTo('get_files');
        expect(go).to.respondTo('get_dest');
        expect(go).to.respondTo('get_target');
    });
});

describe('get_files', function(){
    it('should find directories and apps', function(){
        var dirs = go.options.directories;
        dirs.should.to.be.a('array');
        dirs.should.to.have.length(3);
        for (var i in dirs){
            dirs[i].should.to.be.a('string');
            go._get_files(dirs[i], true);
        }
        go.files.should.to.be.a('object');
        expect(go.files).to.have.keys('app1', 'app2', 'app3', 'app4', 'app5', 'app6');
    });
    it('should get files from "static/app1", "app/app1", "modules/app1" and build in "static/app1"', function(){
        expect(go.files).to.have.property('app1')
            .that.is.an('array')
            .that.is.to.have.length(5)
            .that.is.to.eql(
                ['./tests/fixtures/static/app1/app1_file3.css',
                 './tests/fixtures/static/app1/app1_file4.css',
                 './tests/fixtures/app/app1/app1_file1.css',
                 './tests/fixtures/app/app1/app1_file2.css',
                 './tests/fixtures/modules/app1/app1_file5.css']);
    });
    it('should get files from "app/app2" and "modules/app2" and build in "app/app2"', function(){
        expect(go.files).to.have.property('app2')
            .that.is.an('array')
            .that.is.to.have.length(2)
            .that.is.to.eql(
                ['./tests/fixtures/app/app2/app2_file1.css',
                 './tests/fixtures/modules/app2/app2_file2.css']);
    });
    it('should get files from "static/app3" and "modules/app3" and build in "static/app3"', function(){
        expect(go.files).to.have.property('app3')
            .that.is.an('array')
            .that.is.to.have.length(3)
            .that.is.to.eql(
                ['./tests/fixtures/static/app3/app3_file1.css',
                 './tests/fixtures/static/app3/app3_file2.css',
                 './tests/fixtures/modules/app3/app3_file3.css']);
    });
    it('should get files from "app/app4" and build in "app/app4"', function(){
        expect(go.files).to.have.property('app4')
            .that.is.an('array')
            .that.is.to.have.length(3)
            .that.is.to.eql(
                ['./tests/fixtures/app/app4/app4_file1.css',
                 './tests/fixtures/app/app4/app4_file2.css',
                 './tests/fixtures/app/app4/app4_file3.css']);
    });
    it('should get files from "modules/app5" and build in "modules/app5"', function(){
        expect(go.files).to.have.property('app5')
            .that.is.an('array')
            .that.is.to.have.length(2)
            .that.is.to.eql(
               ['./tests/fixtures/modules/app5/app5_file1.css',
                './tests/fixtures/modules/app5/app5_file2.css']);
    });
    it('should get files from "static/app6" and build in "static/app6"', function(){
        expect(go.files).to.have.property('app6')
            .that.is.an('array')
            .that.is.to.have.length(4)
            .that.is.to.eql(
               ['./tests/fixtures/static/app6/app6_file1.css',
                './tests/fixtures/static/app6/app6_file2.css',
                './tests/fixtures/static/app6/app6_file3.css',
                './tests/fixtures/static/app6/app6_file4.css']);
    });
});

describe('get_dest', function(){
    it('should find destanation directory', function(){
        for(var app_name in go.get_files()) {
            var dest = go.get_dest(app_name);
            dest.should.be.a('string');
        }
    });
});

describe('get_target', function(){
    it('should set target file', function(){
        for(var app_name in go.get_files()) {
            app_name.should.be.a('string');
            go.get_target(app_name).should.be.a('string');
            expect(go.get_target(app_name)).to.contain(go.options.target_prefix, app_name);
        }
    });
});
