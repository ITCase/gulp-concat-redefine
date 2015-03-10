var fs = require('fs'),
    assert = require('assert'),
    globby = require("globby"),
    expect = require('chai').expect,
    should = require('chai').should();

var gulpOverride = require('../index');

var options = {
    // priority == sort
    directories: [
        './example/project/static/',
        './example/project/apps/',
        './example/itcase-dev/',
    ],
    modules_dir: '../itcase/',
    ignore_modules: ['itcase-gallery-simple', 'pyramid_sacrud_gallery', 'pyramid_sacrud_pages'],
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
        go.options.should.have.property('ignore_modules').that.is.a('array');
        go.options.should.have.property('type').that.is.a('string');
        go.options.should.have.property('ignore_dirs').that.is.a('array');
        go.options.should.have.property('target_prefix').that.is.a('string');
    });

    it('Check methods', function(){
        expect(go).to.respondTo('get_files');
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
        var files_obj = go.get_files();
        expect(files_obj).to.be.a('object');
        expect(files_obj).to.equal(go.files);
        for(var app_name in files_obj) {
            expect(app_name).to.be.a('string');
            expect(files_obj[app_name]).to.be.an('array').that.to.deep.be.not.empty;
            var path = files_obj[app_name][0];
            fs.exists(path, function (exists) {
                expect(exists).to.be.true;
            });
        }
    });
});

describe('Test get_dest', function(){
    it('Check method options', function(){
        var key = 'some_app1'
        app_files = go.files[key],
        dest = go.options.directories,
        type = go.options.type;

        app_files.should.be.a('array');
        app_files.should.be.to.have.length.of.at.least(0);
        dest.should.be.a('array');
        type.should.be.a('string');

        console.error(app_files);
    });
    it('Get concat dir', function(){
        for(var app_name in go.get_files()) {
            go.get_dest(app_name).should.be.a('string');
        }
    });
});

describe('Test get_target', function(){
    it('Get target file', function(){
        for(var app_name in go.get_files()) {
            go.get_target(app_name).should.be.a('string');
            var target_file = go.options.target_prefix + app_name + '.' + go.options.type;
        }
    });
});
