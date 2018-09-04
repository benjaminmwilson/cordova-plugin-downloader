# cordova-plugin-downloader

Cordova plugin to download, store and unzip files with no `cordova-file-transfer`
dependency. `cordova-file-transfer` was recently [depreciated](https://cordova.apache.org/blog/2017/10/18/from-filetransfer-to-xhr2.html).

Inspired by `cordova-plugin-fastrde-downloader` but with less features.


## Compatibility

- Android 4.4+
- iOS 10+
- Cordova 5.0+


## Installation

    cordova plugin add cordova-plugin-downloader

This will also install `cordova-plugin-file` and `cordova-plugin-zip` if
not already installed.

## Basic Usage

```javascript
var dl = new download();

dl.Initialize({
    fileSystem : cordova.file.dataDirectory,
    folder: "code",
    unzip: true,
    remove: true,
    timeout: 0,
    success: DownloaderSuccess,
    error: DownloaderError,
    headers: [
        {
            Key: 'Authorization',
            Value: 'Basic ' + btoa(token)
        }
    ]
});


dl.Get("https://www.yourdomain.com/somezipfile.zip");

function DownloaderError(err) {
    console.log("download error: " + err);
    alert("download error: " + err);
}

function DownloaderSuccess() {
    console.log("yay!");
}
```


## Initialization


| key           | default                      |description   |
|:------------- |:---------------------------- |:-------------|
| `fileSystem`  | `cordova.file.dataDirectory` | Cordova filesystem root to work in. More details [here](https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-file/index.html)|
| `folder`      | `folder`                     | Directory within `fileSystem` to store downloaded file and unzip. Created if doesn't exist|
| `unzip`       | `false`                      | Set `true` to attempt to unzip the downloaded file|
| `remove`      | `false`                      | Set `true` to remove the zip file after unzipping|
| `timeout`     | `0`                          | Download timeout in milliseconds. Set to 0 for infinite time|
| `success`     | `undefined`                  | Success callback|
| `error`       | `undefined`                  | Error callback. Argument indicates problem|
| `headers`     | `[]`                         | Set XHR Headers. Accepts a list of Key/Value pairs. `[{Key: 'Authorization', Value: 'Basic xxxxxxx'}]`|


## Error Codes

| code          |description                            |
|:------------- |:--------------------------------------|
| 0             | Cannot resolve filesystem             |
| 1             | download.Get supported on Cordova only|
| 2             | Cannot create destination folder      |
| 3             | Transfer error                        |
| 4             | Abort                                 |
| 5             | Network error                         |
| 6             | Timeout                               |
| 7             | File create error                     |
| 8             | File write error                      |
| 9             | UNZIP error                           |
| 10            | Delete error #1                       |
| 11            | Delete error #2                       |

## Troubleshooting

Chrome / Safari debugging reveals many basic problems but if this isn't
sufficient suggest `adb logcat` for Android and Xcode Window->Devices and Simulators
for iOS. Example Android with filter for app `com.yourco.yourapp`:

macOS / Linux:

    adb logcat | grep `adb shell ps | grep com.yourco.yourapp | cut -c10-15`

Windows (assumes you have `grep` somewhere in your Windows path):

    for /F %i in ('adb shell "ps|grep com.yourco.yourapp|cut -c10-15"') do set ANPID=%i&adb logcat|grep %ANPID%

...where `com.yourco.yourapp` is your App's package name.




