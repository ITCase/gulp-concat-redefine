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

describe('Check object options', function(){
    it('Check gulp-concat-redefine options', function(){
        go.should.have.property('options').that.is.a('object');
        go.options.should.have.property('directories').that.is.a('array');
        go.options.should.have.property('modules_dir').that.is.a('string');
        go.options.should.have.property('ignore_modules').that.is.a('array');
        go.options.should.have.property('type').that.is.a('string');
        go.options.should.have.property('ignore_dirs').that.is.a('array');
        go.options.should.have.property('target_prefix').that.is.a('string');
    });
    it('Check gulp-concat-redefine modules_list', function(){
        go.should.have.property('modules_list').that.is.a('array');
    });
    it('Check gulp-concat-redefine files', function(){
        go.should.have.property('files').that.is.a('object');
    });
});

describe('Check get_files', function(){
    it('Get directories list', function(){
       expect(go).itself.to.respondTo('get_files');
    });
});

describe('Check get_files', function(){
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
            break;
        }
        // etc...
    });
});