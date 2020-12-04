const path = require("path");
const fs = require("fs");
// UNDO: Ignore .gitignore file
const dir = './';

let upgradeDependencies = [];
try{
    let _upgradeDependencies = require("../../../package.json").upgradeDependencies
    for (const component in _upgradeDependencies) {
        let package = _upgradeDependencies[component]||"";
        let oldPackage = "react-native";

        let replaceValue = "";

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
        const reg = `(import.*?)(${component}.*?[,])(.*?${oldPackage.trim()}["|'])`;

        /**
         * {
         *   "ART": "import * as ART from '@react-native-community/art'"
         * }
         * **/
        if(new RegExp(/'(.+)'|"(.+)"/).test(package)){
            replaceValue = `$1$3\n${package.trim()};`;
            package = new RegExp(/'(.+)'|"(.+)"/).exec(package)[1];
        }else {
            /**
             * {
             *   "WebView": "react-native-webview"
             * }
             * **/
            replaceValue = `$1$3\nimport ${component} from "${package}";`
        }

        upgradeDependencies.push({
            component,
            package,
            oldPackage,
            replaceValue,
            reg
        });
    }
}catch (e) {
}
console.log("🔭 Start upgrade ... \n");

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
                                let _data = "";
                                let _install = {};
                                upgradeDependencies.forEach(b=>{
                                    if(new RegExp(b.reg).test(data)){
                                        _data = (_data||data).replace(new RegExp(b.reg),b.replaceValue);
                                        _install[pathname] ? _install[pathname].push("\""+b.package+"\"") : _install[pathname] = ["\""+b.package+"\""];
                                    }
                                })
                                if(_data){
                                    fs.writeFile(pathname, _data,callback.bind(this,path.resolve(pathname),_install[pathname].join(" 、 ")));
                                }
                            })
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
