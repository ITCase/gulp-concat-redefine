var fs = require('fs'),
    assert = require('assert'),
    globby = require("globby"),
    expect = require('chai').expect,
    should = require('chai').should();

var gulpOverride = require('../index');

var options = {
    // priority == sort
    directories: [
        './tests/fixtures/static/',
        './tests/fixtures/app/',
        './tests/fixtures/modules/',
    ],
    modules_dir: 'itcase-dev',
    ignore_dir: ['ignore-directory'],
    type: 'css'
};

var go = new gulpOverride(options);

describe('Test object options', function(){
    it('Check options', function(){
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

    it('Check methods', function(){
        expect(go).to.respondTo('get_files');
        expect(go).to.respondTo('_get_files');
        expect(go).to.respondTo('get_dest');
        expect(go).to.respondTo('get_target');
    });
});

describe('Check get_files', function(){
    it('Get directories list', function(){
       expect(go).itself.to.respondTo('get_files');
    });
});

describe('Test get_files', function(){
    it('Get directories list', function(){
        var dirs = go.options.directories;
        dirs.should.to.be.a('array');
        dirs.should.to.have.length(3);
        for (var i in dirs){
            dirs[i].should.to.be.a('string');
            go._get_files(dirs[i], true);
        }
        go.files.should.to.be.a('object');
        expect(go.files).to.have.keys('app1', 'app2', 'app3', 'app4', 'app5', 'app6');
        expect(go.files).to.have.property('app1')
            .that.is.an('array')
            .that.is.to.have.length(5)
            .that.is.to.eql(
                ['./tests/fixtures/static/app1/app1_file3.css',
                 './tests/fixtures/static/app1/app1_file4.css',
                 './tests/fixtures/app/app1/app1_file1.css',
                 './tests/fixtures/app/app1/app1_file2.css',
                 './tests/fixtures/modules/app1/app1_file5.css']);
        expect(go.files).to.have.property('app2')
            .that.is.an('array')
            .that.is.to.have.length(2)
            .that.is.to.eql(
                ['./tests/fixtures/app/app2/app2_file1.css',
                 './tests/fixtures/modules/app2/app2_file2.css']);
        expect(go.files).to.have.property('app3')
            .that.is.an('array')
            .that.is.to.have.length(3)
            .that.is.to.eql(
                ['./tests/fixtures/static/app3/app3_file1.css',
                 './tests/fixtures/static/app3/app3_file2.css',
                 './tests/fixtures/modules/app3/app3_file3.css']);
        expect(go.files).to.have.property('app4')
            .that.is.an('array')
            .that.is.to.have.length(3)
            .that.is.to.eql(
                ['./tests/fixtures/app/app4/app4_file1.css',
                 './tests/fixtures/app/app4/app4_file2.css',
                 './tests/fixtures/app/app4/app4_file3.css']);
        expect(go.files).to.have.property('app5')
            .that.is.an('array')
            .that.is.to.have.length(2)
            .that.is.to.eql(
               ['./tests/fixtures/modules/app5/app5_file1.css',
                './tests/fixtures/modules/app5/app5_file2.css']);
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

describe('Check get_dest', function(){
    it('Set concat target', function(){
        for(var app_name in go.get_files()) {
            go.get_target(app_name).should.be.a('string');
            var target_file = go.options.target_prefix + app_name + '.' + go.options.type;
        }
    });
});

describe('Test get_dest', function(){
    it('Get concat dir', function(){
        for(var app_name in go.get_files()) {
            go.get_dest(app_name).should.be.a('string');
            var dest = go.get_dest(app_name);
        }
    });
});

describe('Test get_target', function(){
    it('Get target file', function(){
        for(var app_name in go.get_files()) {
            go.get_target(app_name).should.be.a('string');
            var target_file = go.get_target(app_name);
        }
    });
});
