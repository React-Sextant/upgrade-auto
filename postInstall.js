var fs = require('fs');
var spath = require('path');

function eachFileSync (dir, findOne) {
    var stats = fs.statSync(dir);
    var files = fullPath(dir, fs.readdirSync(dir));
    files.forEach(function (item) {
        findOne(item, stats);
    });
}

function fullPath (dir, files) {
    return files.map(function (f) {
        return spath.join(dir, f);
    });
}

getPackageJson("./../../..", function (f, s) {
    var isPackageJson = f.match(/package\.json/);
    if (isPackageJson != null) {
        console.log("find package.json file: " + f);
        if (isFile(f) == false) {
            console.log("configure package.json error!!");
            return;
        }
        var rf = fs.readFileSync(f, "utf-8");
        var packagejson = JSON.parse(rf);
        if(packagejson.hasOwnProperty("scripts")){
            packagejson.scripts["upgrade-components"] = "node node_modules/@react-sextant/upgrade-auto/upgrade-components.js"
        }else {
            packagejson["scripts"] = {"upgrade-components":"node node_modules/@react-sextant/upgrade-auto/upgrade-components.js"}
        }

        if(!packagejson.hasOwnProperty("upgradeDependencies")){
            packagejson["upgradeDependencies"] = {
                "WebView": "react-native-webview",
                "NetInfo": "@react-native-community/netinfo",
                "CameraRoll": "@react-native-community/cameraroll",
                "ImageEditor": "@react-native-community/image-editor",
                "ViewPagerAndroid": "@react-native-community/viewpager"
            }
        }

        fs.writeFileSync(f, JSON.stringify(packagejson, null, 2), "utf-8");
    }
});

function getPackageJson(dir, findOne) {
    if (typeof findOne !== 'function') {
        throw new TypeError('The argument "findOne" must be a function');
    }

    eachFileSync(spath.resolve(dir), findOne);
}

function isFile(path){
    return exists(path) && fs.statSync(path).isFile();
}

function exists(path){
    return fs.existsSync(path) || path.existsSync(path);
}
