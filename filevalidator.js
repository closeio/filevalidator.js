define([
    'underscore',
],

function(_) {
    'use strict';

    // https://en.wikipedia.org/wiki/List_of_file_signatures
    var fileSignatures = {
        'mp3': [
            // MPEG-1 Layer 3 file without an ID3 tag or with an ID3v1 tag (which's appended at the end of the file)
            [0xFF, 0xFB],
            // MP3 file with an ID3v2 container
            [0x49, 0x44, 0x33],
            // Other MP3 files (FF Fx and FF Ex – they may cause false-positives)
            // Headers taken from https://www.garykessler.net/library/file_sigs.html
            [0xFF, 0xE0], [0xFF, 0xE1], [0xFF, 0xE2], [0xFF, 0xE3], [0xFF, 0xE4],
            [0xFF, 0xE5], [0xFF, 0xE6], [0xFF, 0xE7], [0xFF, 0xE8], [0xFF, 0xE9],
            [0xFF, 0xEA], [0xFF, 0xEB], [0xFF, 0xEC], [0xFF, 0xED], [0xFF, 0xEE], [0xFF, 0xEF],
            [0xFF, 0xF0], [0xFF, 0xF1], [0xFF, 0xF2], [0xFF, 0xF3], [0xFF, 0xF4],
            [0xFF, 0xF5], [0xFF, 0xF6], [0xFF, 0xF7], [0xFF, 0xF8], [0xFF, 0xF9],
            [0xFF, 0xFA], [0xFF, 0xFB], [0xFF, 0xFC], [0xFF, 0xFD], [0xFF, 0xFE], [0xFF, 0xFF]
        ],
        'wav': [
            // Waveform Audio File Format
            // Empty slots can be any byte. Can't look at only first 4 or else .avi files match
            [0x52, 0x49, 0x46, 0x46, , , , , 0x57, 0x41, 0x56, 0x45]
        ],
    };

    /**
     * Compare an Uint8Array with an expected file signature.
     * Can't do a direct equality check since some signatures (e.gfor wav files) have wildcard slots.
     * @param {array} sig - pattern from fileSignatures
     * @param {Uint8Array} actual - bytes from file (should already be sliced to match length of sig)
     * @returns {boolean} - do they match
     */
    var compareSignature = function(sig, actual) {
        if (sig.length !== actual.length) return false;
        for (var i = 0, l = sig.length; i < l; i++) {
            if (sig[i] !== actual[i] && typeof sig[i] !== 'undefined') return false;
        }
        return true;
    };

    /**
     * @param {Uint8Array} uint8
     * @param {string} type
     * @returns {boolean}
     */
    var matchesFileType = function(uint8, type) {
        return _.find(fileSignatures[type], function(sig) {
            return compareSignature(sig, uint8.subarray(0, sig.length));
        });
    };

    /**
     * Detect, through file signature / mime sniffing detection, if a given File
     * matches an expected type or types. The types supported are the keys in
     * fileSignatures above.
     * @param {File} file
     * @param {(string|string[])} types - e.g. 'mp3' or ['mp3', 'wav']
     * @param {function} - callback which is passed a boolean
     */
    var verifyFileType = function(file, types, cb) {
        if (_.isString(types)) types = [types];

        // Calculate the longest file signature for any of the requested
        // types, so we know how many bytes of this file to look at.
        var bytesNeeded = types.reduce(function(prevMax, type, idx, arr) {
            var sigs = fileSignatures[type];
            return Math.max.apply(this, [prevMax].concat(sigs.map(function(sig) {
                return sig.length;
            })));
        }, 0);

        // Load file into ArrayBuffer and see if its first few bytes match
        // the signature of any of our requested types. Let callback know.
        var reader = new FileReader();
        reader.onload = function(e) {
            // Load only as many bytes from the array buffer as necessary
            var arrayBuffer = e.currentTarget.result;
            var bytes = new Uint8Array(arrayBuffer, 0, bytesNeeded);
            var match = _.find(types, function(type) {
                return matchesFileType(bytes, type);
            });
            cb(match);
        };
        reader.readAsArrayBuffer(file);
    };

    // Expose public interface
    var FileDetector = {
        verifyFileType: verifyFileType
    };

    return FileDetector;
});

