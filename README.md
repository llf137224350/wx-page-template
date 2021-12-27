# 微信小程序创建页面模板工具
## 使用方式
* 安装 npm install wx-page-template-js -g
  * 1. 进入需要创建页面的目录
  * 2. page 页面名称，名称多个单词时使用下横线连接。如：page order_list



## 个性化配置（package.json）
```javascript
/*
 * @Author: $author
 * @Date: $date
 * @Description:
 */
"pageTemplateConfig": {
    "author": "い 狂奔的蜗牛", // ts/js顶部注释$author
    "pageTitle": "页面标题", // 页面标题
    "pageTemplateDir": "/Users/snail/Desktop/test_template" // 自定义模板路径（wxml、wxss、json、ts/js所在目录）,如果不指定，则使用自带模板
  }
