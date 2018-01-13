'use strict';

/** @namespace require **/
/** @namespace describe **/
/** @namespace it **/
/** @namespace global **/

var download = require('../www/download');
var expect = require('chai').expect;

global.cordova = { file : { dataDirectory : "/data"} };

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
    });



});