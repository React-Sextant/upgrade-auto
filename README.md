|版本|升级指南|
|----|----|
|0.60+|内置组件移除|
 
# 如何使用？<a href="https://www.npmjs.com/package/@react-sextant/upgrade-auto"><img alt="npm version" src="http://img.shields.io/npm/v/@react-sextant/upgrade-auto.svg?style=flat-square"></a>
```bash
$ npm i @react-sextant/upgrade-auto

$ npm run upgrade-components
```
# package.json变化⚠️
> 安装成功后 package.json将会被自动修改⚠️
> 那些被移除的内置组件，需要在`package.json`中的`upgradeDependencies`字段中添加对应替换的npm包名
```diff
 {
   "name": "xxx",
   "version": "0.0.1",
   "scripts": {
     ...

+    "upgrade-components": "node node_modules/@react-sextant/upgrade-auto/upgrade-components.js"
   },

   ...

+  "upgradeDependencies": {
+    "WebView": "react-native-webview",
+    "NetInfo": "@react-native-community/netinfo",
+    "CameraRoll": "@react-native-community/cameraroll",
+    "ImageEditor": "@react-native-community/image-editor",
+    "ViewPagerAndroid": "@react-native-community/viewpager"
+  }

 }
```
# 当React-Native版本升级时遇到了问题

<details>
<summary><b>常见问题1：</b></summary>
<code>
'WebView has been removed from React Native. It can now be installed and imported from 'react-native-webview' instead of 'react-native'. " See https://github.com/react-native-community/react-native-webview',
</code>
</details>

## 移除了哪些组件？
https://github.com/react-native-community/releases/blob/master/CHANGELOG.md#removed-3

## 第三方库不再维护怎么办？

 - fork+自己维护
 - 使用本脚步自动更新（适用于仅仅改个组件依赖方式）
   ```diff
   -  import {WebView, Button} from 'react-native'
   +  import {Button} from 'react-native'
   +  import {WebView} from 'react-native-native'
   ```
