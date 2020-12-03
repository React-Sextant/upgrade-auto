const path = require("path");
const fs = require("fs");
// UNDO: Ignore .gitignore file
const dir = './';

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
                                    let package = upgradeDependencies[component]||"";
                                    let oldPackage = "react-native";

                                    /**
                                     * {
                                     *   "NavigationActions": "@react-navigation/compat > react-navigation"
                                     * }
                                     * **/
                                    if(package.indexOf(">") > -1){
                                        const _arr = package.split(">");
                                        package = _arr[0];
                                        oldPackage = _arr[1];
                                    }

                                    const reg = `(import.*)(${component}.*[,])(.*${oldPackage.trim()}["|'].*)`;
                                    if(new RegExp(reg).test(data)){
                                        /**
                                         * {
                                         *   "ART": "import * as ART from '@react-native-community/art'"
                                         * }
                                         * **/
                                        if(new RegExp(/'(.+)'|"(.+)"/).test(package)){
                                            _data = (_data||data).replace(new RegExp(reg),`$1$3\n${package.trim()};`);
                                            package = new RegExp(/'(.+)'|"(.+)"/).exec(package)[1];
                                        }else {
                                            /**
                                             * {
                                             *   "WebView": "react-native-webview"
                                             * }
                                             * **/
                                            _data = (_data||data).replace(new RegExp(reg),`$1$3\nimport ${component} from "${package}";`);
                                        }
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
