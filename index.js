"use strict";

var wallpaper = require('wallpaper')
var Jimp = require('jimp')
var rp = require('request-promise')
var fs = require('fs')
var interval = 10 * 1000

var fsPath = __dirname + '/place.png'
var url = 'https://www.reddit.com/api/place/board-bitmap'
var colors = ["#FFFFFF", "#E4E4E4", "#888888", "#222222", "#FFA7D1", "#E50000", "#E59500", "#A06A42", "#E5D900", "#94E044", "#02BE01", "#00D3DD", "#0083C7", "#0000EA", "#CF6EE4", "#820080"]

for (var i = 0; i < colors.length; i++) {
    var x = Uint8Array.of(0, 0, 0, 255);
    x[0] = parseInt(colors[i].substr(1, 2), 16);
    x[1] = parseInt(colors[i].substr(3, 2), 16);
    x[2] = parseInt(colors[i].substr(5, 2), 16);
    colors[i] = x
}

var pngImage = new Jimp(1000, 1000);

function updateWallpaper() {
    var r, image = new Uint8Array(1000 * 1000);
    var s = 0;
    function read(source) {
        if (!r) {
            r = (new Uint32Array(source.buffer, 0, 1))[0];
            source = new Uint8Array(source.buffer, 4);
        }
        for (var t = 0; t < source.byteLength; t++) {
            image[s + 2 * t] = source[t] >> 4;
            image[s + 2 * t + 1] = source[t] & 15;
        }
        s += source.byteLength * 2
    }
    rp.get(url, { encoding: null })
    .then(function (buffer) {
        read(buffer);
        var color;
        for (var i = 0; i < image.byteLength; i++) {
            var colorBytes = colors[image[i]];
            pngImage.bitmap.data[(4 * i)] = colorBytes[0];
            pngImage.bitmap.data[(4 * i) + 1] = colorBytes[1];
            pngImage.bitmap.data[(4 * i) + 2] = colorBytes[2];
            pngImage.bitmap.data[(4 * i) + 3] = colorBytes[3];
        }

        return new Promise(function (accept) {
            pngImage.write(fsPath, accept);
        })
    })
    .then(function () {
        return wallpaper.set(fsPath);
    })
    .then(function () {
        console.log('Updated wallpaper. Will update again in ' + interval + 'ms');
        setTimeout(updateWallpaper, interval);
    })
    .catch(console.error);
}

updateWallpaper();
