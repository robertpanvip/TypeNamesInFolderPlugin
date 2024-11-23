   

type-names-in-folder-plugin
===========================

type-names-in-folder-plugin

[![NPM Version](https://img.shields.io/npm/v/type-names-in-folder-plugin?color=33cd56&logo=npm)](https://www.npmjs.com/package/type-names-in-folder-plugin)  [![NPM Version](https://img.shields.io/npm/dm/type-names-in-folder-plugin.svg?style=flat-square)](https://www.npmjs.com/package/type-names-in-folder-plugin)  [![unpacked size](https://img.shields.io/npm/unpacked-size/type-names-in-folder-plugin?color=green)](https://www.npmjs.com/package/type-names-in-folder-plugin)  [![Author](https://img.shields.io/badge/docs_by-robertpanvip-blue)](https://github.com/robertpanvip/type-names-in-folder-plugin.git)

📦 **Installation**
-------------------

    npm install type-names-in-folder-plugin

🏠 Exports
----------

### 

|参数|类型|
|---|---|
|🐕default|`Classes`|
|🧷Option|`Type Aliases`|

**🐕Classes**
-------------

  
  

TypeNamesInFolderPlugin 用于根据指定目录内的文件名生成 TypeScript 类型声明文件。  
  

#### TypeNamesInFolderPlugin

|参数|类型|说明|默认值|
|---|---|---|---|
|\_\_constructor|*   构造函数  
      
    
*   new default(options:`Option`): `default`|||
|cachedNames|: `Set`<`string`\>|||
|distDir|: `string`|||
|render|?: ((names:`string`\[\]) => `string`)|||
|suffix|: `string`|||
|suffixName|: `string`|||
|watchDir|: `string`|||
|apply|*   Webpack 插件的主函数  
      
    
*   apply(compiler:`Compiler`): `Promise`<`void`\>|||
|generateDeclarationContent|*   生成声明文件内容  
      
    
*   generateDeclarationContent(names:`string`\[\]): `string`|||
|getFileNames|*   获取指定目录内的文件名（去除后缀）  
      
    
*   getFileNames(dirPath:`string`): `Promise`<`string`\[\]\>|||
|hasFileNamesChanged|*   检测文件名是否有变化  
      
    
*   hasFileNamesChanged(currentNames:`string`\[\]): `boolean`|||

**🧷Type Aliases**
------------------

  
  

插件选项类型定义  
  

#### Option

|参数|类型|说明|默认值|
|---|---|---|---|
|distDir|?: `string`|输出声明文件的目录路径（默认为 watchDir）||
|render|?: ((names:`string`\[\]) => `string`)|自定义生成声明文件内容的渲染函数||
|suffix|: `string`|要监听的文件后缀名（如 ".ts"）||
|watchDir|: `string`|需要监听的目录路径||