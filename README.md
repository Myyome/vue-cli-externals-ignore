vue-cli node modules externals
==============================
> 稍微改了下 webpack-node-externals 让 vue-cli 也能支持 ,主要用于 build lib
https://github.com/liady/webpack-node-externals

### 使用
```
const nodeExternals = require('vue-cli-externals-ignore');

 configureWebpack: {
    externals: nodeExternals(),
  },

```