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
                        setTimeout(function(){travel(pathname,callback,finish)},1)
                    }else {
                        const extname = path.extname(pathname);

                        if(extname === ".js" || extname === ".ts" || extname === ".tsx"){
                            fs.readFile(pathname, "utf8", function(err, data) {

                                const initialData = {data, installs:[]};
                                const reducer = function(state, action){
                                    if(new RegExp(action.reg).test(state.data)){
                                        return {
                                            data:state.data.replace(new RegExp(action.reg),action.replaceValue),
                                            installs:[...state.installs, "\""+action.package+"\""]
                                        }
                                    }else {
                                        return state
                                    }
                                };
                                const finalData = Array.prototype.reduce.call(
                                    upgradeDependencies,
                                    reducer,
                                    initialData
                                );
                                if(finalData.installs.length>0){
                                    fs.writeFile(pathname, finalData.data,callback.bind(this,path.resolve(pathname),finalData.installs.join(" 、 ")));
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
