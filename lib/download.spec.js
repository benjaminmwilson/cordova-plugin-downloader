'use strict';

/** @namespace require **/
/** @namespace describe **/
/** @namespace it **/
/** @namespace global **/

var download = require('../www/download'); //module under test

//chai setup
var chai = require('chai');
var expect = chai.expect;
var spies = require('chai-spies');
var should = chai.should;

chai.use(spies);
chai.use(should);

//constants and Cordova constants
var dlSuccess = chai.spy();
var dlError = chai.spy();

global.cordova = { file : { dataDirectory : "/data/"} };

var dlConfig = {
    fileSystem: cordova.file.dataDirectory,
    folder: "code",
    unzip: true,
    remove: true,
    success: dlSuccess,
    error: dlError
};

var zipFileName = "hello.zip";
var zipUrl = "http://fakeurl.com/" + zipFileName;

var fakeOpen = chai.spy();
var fakeSend = chai.spy();


console.log("    test setup started");

//** fake resolveLocalFileSystemURL
var resolveLocalFileSystemURLCount = 0;

global.window = {
    resolveLocalFileSystemURL :  function (fileSystem, success, error) {

        //behave differently (fake directory) on first run
        if(resolveLocalFileSystemURLCount++ === 0) {
            //console.log("fake resolveLocalFileSystemURL 1");
            success(parentEntry);
        }
        else {
            //console.log("fake resolveLocalFileSystemURL 2");
            success(deleteFileEntry);
        }



    }
};

chai.spy.on(global.window, 'resolveLocalFileSystemURL');

var parentEntry = {

    isDirectory : true,
    getDirectory : function(folder, mode, success, error) {
        //console.log("fake getDirectory");
        success(dirEntry);
    }
};

chai.spy.on(parentEntry, 'getDirectory');

var dirEntry = {
    getFile : function(filename, mode, success, error) {
        //console.log("fake getFile");
        success(fileEntry);
    }
};

chai.spy.on(dirEntry, 'getFile');


var deleteFileEntry = {
    isFile : true,
    remove : function(success, error) {
        //console.log("fake remove");
        success();
    }

};

var fileEntry = {

    createWriter : function(success) {

        //console.log("fake createWriter");
        success(fileWriter);

    },

    fullPath : dlConfig.folder + '/' + zipFileName

};

var fileWriter  = {

    write: function(dataObj) {
        this.onwriteend();
    }
};

//** fake XMLHttpRequest

function FakeXMLHttpRequest() {

    var that = this;

    this.status = 200;

    this.open = function(method, url, async) {
        fakeOpen(method, url, async);
    };

    this.send = function() {
        fakeSend();
        that.onload();
    };

}

global.XMLHttpRequest = FakeXMLHttpRequest;
chai.spy.on(global, 'XMLHttpRequest');

//** fake Blob

function FakeBlob() {

}

global.Blob = FakeBlob;

//** fake Unzip

global.zip = {
    unzip : function(zipPath, zipDestFolder, complete) {
        //console.log(zipPath, zipDestFolder);
        complete(0);
    }
};

chai.spy.on(global.zip, 'unzip');

console.log("    test setup complete");



describe('download module', function () {

    describe('download constructor', function () {
        it('should export a function', function () {
            expect(download).to.be.a('function');
        });
    });

    describe('download.Initialize', function () {
        it('should export a function', function () {
            var dl = new download();

            expect(dl.Initialize).to.be.a('function');

        });
    });

    describe('download.Get', function () {

        it('should export a function', function () {
            var dl = new download();

            expect(dl.Get).to.be.a('function');

        });

        it('should get a URL using XMLHttpRequest and unzip the downloaded file using Cordova zip plugin', function () {

            //this jshint because chai syntax like 'dlSuccess.should.have.been.called.once' not liked by jshint
            /* jshint expr: true */

            var dl = new download();

            dl.Initialize(dlConfig);

            dl.Get(zipUrl);

            dlSuccess.should.have.been.called.once;
            dlError.should.not.have.been.called;

            global.window.resolveLocalFileSystemURL.should.have.been.called.twice;

            global.window.resolveLocalFileSystemURL.should.have.been.first.called.with('/data/');
            global.window.resolveLocalFileSystemURL.should.have.been.second.called.with('/data/code/hello.zip');

            parentEntry.getDirectory.should.have.been.called.once;
            parentEntry.getDirectory.should.have.been.called.with('code', { create: true });

            global.XMLHttpRequest.should.have.been.called.once;

            fakeOpen.should.have.been.called.once;
            fakeOpen.should.have.been.called.with('GET', 'http://fakeurl.com/hello.zip', true);
            fakeSend.should.have.been.called.once;

            dirEntry.getFile.should.have.been.called.once;
            dirEntry.getFile.should.have.been.called.with('hello.zip', { create: true, exclusive: false });

            global.zip.unzip.should.have.been.called.once;
            global.zip.unzip.should.have.been.called.with("/data/code/hello.zip", "/data/code");


        });
    });



});