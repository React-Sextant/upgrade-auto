const path = require("path");
const fs = require("fs");
const dir = './node_modules';

let upgradeDependencies = {};
try{
    upgradeDependencies = require("../../../package.json").upgradeDependencies
}catch (e) {
}
console.log("🔭 Start upgrade ... \n",upgradeDependencies);

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
                                // const WebView = /(import.*)(WebView\s*,|WebView,|WebView)(.*react-native["|'].*)/;

                                let _data = "";
                                let _install = {};
                                for (const component in upgradeDependencies) {
                                    const package = upgradeDependencies[component];
                                    const reg = `(import.*)(${component}\s*,|${component},|${component})(.*react-native["|'].*)`;
                                    if(new RegExp(reg).test(data)){
                                        _data = (_data||data).replace(new RegExp(reg),`$1$3\nimport {${component} } from "${package}";`);
                                        _install[pathname] ? _install[pathname].push("\""+package+"\"") : _install[pathname] = ["\""+package+"\""];
                                    }
                                }
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
    console.log("🔭 Finish")
});
