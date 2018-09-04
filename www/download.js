/** @namespace cordova **/

function Download() {
    this.Settings = {
        fileSystem : cordova.file.dataDirectory,
        folder: "folder",
        unzip: false,
        remove: false,
        timeout: 0,
        headers: []
    };
}

/**
 * Initialize module
 * @param {object} settings Properties: .fileSystem (destination cordova filesystem),
 * .folder (destination directory within .fileSystem), .unzip (set true to unzip), .remove (set true to remove zip after unzip)
 * .success (function to call when successful), .error (function to call on error)
 *
 */
Download.prototype.Initialize = function(settings) {

    if(typeof settings.fileSystem !== "undefined") {
        this.Settings.fileSystem = settings.fileSystem;
    }

    if(typeof settings.folder !== "undefined") {
        this.Settings.folder = settings.folder;
    }

    if(typeof settings.unzip !== "undefined") {
        this.Settings.unzip = settings.unzip;
    }

    if(typeof settings.remove !== "undefined") {
        this.Settings.remove = settings.remove;
    }

    if(typeof settings.timeout !== "undefined") {
        this.Settings.timeout = settings.timeout;
    }
    
    if(typeof settings.headers !== "undefined") {
        this.Settings.headers = settings.headers;
    }

    if(typeof settings.success !== "undefined") {
        this.Settings.success = settings.success;
    }

    if(typeof settings.error !== "undefined") {
        this.Settings.error = settings.error;
    }

};

Download.prototype.Get = function(url) {

    var that = this;

    if(cordova && typeof window.resolveLocalFileSystemURL !== 'undefined') {
        window.resolveLocalFileSystemURL(this.Settings.fileSystem, GetParentPathSuccess, function() { that.Settings.error(0); /* ERROR 0: Cannot resolve filesystem */});
    }
    else {
        console.log("download.Get supported on Cordova only");
        this.Settings.error(1); //ERROR 1: Cordova only
    }

    function GetParentPathSuccess(parentEntry) {

        if(parentEntry.isDirectory === false) {
            that.Settings.error(2);  //ERROR 2: Cannot create destination folder
        }
        else {
            parentEntry.getDirectory(that.Settings.folder, {create: true}, DownloadFile, function() { that.Settings.error(2); });
        }

    }

    function DownloadFile(dirEntry) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        that.Settings.headers.forEach(function(header){
            xhr.setRequestHeader(header.Key, header.Value);
        });        
        xhr.responseType = 'blob';
        xhr.timeout = that.Settings.timeout;

        xhr.onload = function() {
            if (this.status === 200) {

                var blob = new Blob([this.response], { type: 'application/zip' });
                saveFile(dirEntry, blob, GetLastPath(url));
            }
            else {
                that.Settings.error(3); //ERROR 3: Transfer error
            }
        };

        xhr.onabort = function () { that.Settings.error(4); /*ERROR 4: Abort*/ };
        xhr.onerror = function () { that.Settings.error(5); /*ERROR 5: Network error */ };
        xhr.ontimeout = function () { that.Settings.error(6); /*ERROR 6: Timeout */ };


        xhr.send();

    }

    function saveFile(dirEntry, fileData, fileName) {

        dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {

            writeFile(fileEntry, fileData);

        }, function() { that.Settings.error(7); /*ERROR 7: File create error*/ });
    }

    function writeFile(fileEntry, dataObj) {

        // Create a FileWriter object for our FileEntry
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function() {
                //console.log("Successful file write...");

                if(that.Settings.unzip === true) {
                    that.Unzip(fileEntry.fullPath); //TODO Unzip
                }
                else {
                    that.Settings.success();
                }


            };

            fileWriter.onerror = function(e) {
                //console.log("Failed file write: " + e.toString());
                that.Settings.error(8); //ERROR 8: File write error
            };

            fileWriter.write(dataObj);
        });
    }


}; // Get()

Download.prototype.Unzip = function(zipFilePath) {
    //namespace to ignore JSHint warns about zip
    /** @namespace zip **/

    var destFS = this.Settings.fileSystem; // absolute App path to folder
    var that = this;

    zip.unzip(Join([destFS, zipFilePath]), Join([destFS, this.Settings.folder]), UnzipComplete); //cordova zip plugin unzip

    function UnzipComplete(status) {
        if(status === -1) {
            that.Settings.error(9); //UNZIP error
        }
        else if(that.Settings.remove === true) {
            RemoveZipFile(zipFilePath);
        }
        else {
            that.Settings.success();
        }
    }

    function RemoveZipFile(zipFilePath) {

        /** @namespace resolveLocalFileSystemURL **/

        var fszipFilePath = Join([that.Settings.fileSystem, zipFilePath]);

        window.resolveLocalFileSystemURL(fszipFilePath,
            function(entry) {
                if(entry.isFile) {
                    entry.remove(that.Settings.success, function() { that.Settings.error(10); /* Delete error #1 */ });
                }
                else {
                    that.Settings.error(11); //Delete error #2
                }

            },
            that.Settings.success //doesn't exist - don't worry about it
        );
    }

};

/**
 * Returns part of path after the last slash. Trailing slashes are ignored.
 * @param {string} path
 */
function GetLastPath(path) {
    return path.slice(-1) === "/"  ? GetAfterLast(path.slice(0, -1), "/") : GetAfterLast(path, "/");
}

/**
 * Returns substring after last occurrence of s
 * @param str
 * @param s
 */
function GetAfterLast(str, s) {
    return str.substring(str.lastIndexOf(s)+1);
}

/**
 * Joins together a list of paths and returns them without a trailing /
 * @param {Array.<String>} pathList List of paths to join. First path's leading / is preserved
 * @returns {string}
 *
 */
function Join(pathList) {
    var path = "";
    if (pathList.length > 0) {
        path += pathList[0].replace(/\/+$/, "") + "/";
        for (var i = 1; i < pathList.length; i++) {
            path += pathList[i].replace(/^\/+/, "").replace(/\/+$/, "") + "/";
        }
        path = path.slice(0, -1);
    }

    return path;
}

/** @namespace module **/
module.exports = Download;

