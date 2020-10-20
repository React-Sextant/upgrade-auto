const path = require("path");
const fs = require("fs");
const dir = './node_modules';

function travel(dir, callback, finish) {
    fs.readdir(dir, function (err, files) {
        if(files.length>0){
            files.forEach((a,i)=>{
                var pathname = path.join(dir, files[i]);
                fs.stat(pathname, function (err, stats) {
                    if (stats.isDirectory()) {
                        travel(pathname,callback,finish)
                    }else {
                        const extname = path.extname(pathname);
                        if(extname === ".js" || extname === ".ts" || extname === ".tsx"){
                            fs.readFile(pathname, "utf8", function(err, data) {
                                // 当前版本 0.61.4
                                // TODO: 待补充
                                const community_lib = [
                                    {component:"WebView",package:"react-native-webview"},
                                    {component:"NetInfo",package:"@react-native-community/netinfo"},
                                    {component:"CameraRoll",package:"@react-native-community/cameraroll"},
                                    {component:"ImageEditor",package:"@react-native-community/image-editor"},
                                    {component:"ViewPagerAndroid",package:"@react-native-community/viewpager"},
                                ];
                                // const WebView = /(import.*)(WebView\s*,|WebView,|WebView)(.*react-native["|'].*)/;

                                let _data = "";
                                let _install = {};
                                community_lib.forEach(a=>{
                                    const reg = `(import.*)(${a.component}\s*,|${a.component},|${a.component})(.*react-native["|'].*)`;
                                    if(new RegExp(reg).test(data)){
                                        _data = (_data||data).replace(new RegExp(reg),`$1$3\nimport {${a.component} } from "${a.package}";`);
                                        _install[pathname] ? _install[pathname].push("\""+a.package+"\"") : _install[pathname] = ["\""+a.package+"\"","\""+a.package+"\""];
                                    }
                                });
                                if(_data){
                                    fs.writeFile(pathname, _data,callback.bind(this,path.resolve(pathname),_install[pathname].join(" 、 ")));
                                }
                            });
                        }
                    }
                });
            })

        }
    });
}

travel(dir,(a,b)=>{
    console.log("\n🔭 upgrade-components: file://"+a+" has changed, meanwhile you need install "+b+"\n")
},()=>{
    console.log("Finish")
});
