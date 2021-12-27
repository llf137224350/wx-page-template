/*
 * @Author: い 狂奔的蜗牛
 * @Date: 2020/6/17
 * @Description: 创建页面
 */
const os = require('os');
const path = require('path');
const fs = require('fs');
const pathExists = require('path-exists').sync;
const log = require('./log');
// 降低允许权限
require('root-check')();
// 目标路径 - 执行脚本命令所在目录
const targetPath = process.cwd();
// 模板路径
let sourcePath = path.resolve(__dirname, '../template');
// 作者
let author = '';
// 页面标题
let pageTitle = '';
// 页面名称
const pageName = process.argv.slice(2)[0];
if (!pageName) {
  log.error('', '请传入页面名称!');
  return;
}

// 获取package.json文件所在位置
function getPackageJson() {
  let dirs = targetPath.replace(/\\/g, '/').split('/');
  let index = 0;
  while (index < dirs.length) {
    if (index === 0) {
      dirs[index] = '';
    } else {
      dirs[index] = dirs[index - 1] + '/' + dirs[index];
    }
    index++;
  }
  dirs = dirs
    .map(function (dir) {
      return dir + '/package.json';
    })
    .reverse();
  return dirs.find(function (filePath) {
    return pathExists(filePath);
  });
}

// 写入文件内容
function writeContent2File(content, fileName) {
  fileName = pageName + fileName.substring(fileName.indexOf('.'));
  const tempPath = path.resolve(targetPath, pageName + '/' + fileName);
  const data = new Uint8Array(Buffer.from(content));
  // 写入数据到对应文件
  fs.writeFileSync(tempPath, data);
}

// 首字母大写
function firstLetterCapitalized(str) {
  if (!str) {
    return '';
  }
  const firstLetter = str.slice(0, 1);
  const other = str.slice(1);
  return firstLetter.toUpperCase() + other;
}

// 获取类名
function getName() {
  const arr = pageName.split('_');
  let result = '';
  arr.forEach((item) => {
    result += firstLetterCapitalized(item);
  });
  return result;
}

// 读取文件内容
function readFileContent(path, fileName) {
  let content = fs.readFileSync(path).toString();
  if (
    (fileName.indexOf('.js') !== -1 && fileName.indexOf('.json') === -1) ||
    fileName.indexOf('.ts') !== -1
  ) {
    // 替换作者
    content = content.replace(/\$author/g, author);
    // 替换日期
    content = content.replace(/\$date/g, dateFormat(new Date()));
  } else if (fileName.indexOf('.json') !== -1) {
    content = content.replace(/\$title/g, pageTitle);
  }
  writeContent2File(content, fileName);
}

// 日期格式化
function dateFormat(date, fmt = 'yyyy-MM-dd hh:mm:ss') {
  const o = {
    'M+': date.getMonth() + 1, // 月份
    'd+': date.getDate(), // 日
    'h+': date.getHours(), // 小时
    'm+': date.getMinutes(), // 分
    's+': date.getSeconds(), // 秒
    'q+': Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + '').substring(4 - RegExp.$1.length)
    );
  }
  for (const k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length === 1
          ? o[k]
          : ('00' + o[k]).substring(('' + o[k]).length)
      );
    }
  }
  return fmt;
}

// 读取目录下所有文件
function readSourceDir() {
  let files = fs.readdirSync(sourcePath, {
    withFileTypes: true
  });
  files.forEach((item) => {
    // 如果为文件
    if (item.isFile()) {
      readFileContent(path.resolve(sourcePath, item.name), item.name);
    }
  });
  log.success(
    ``,
    '新增页面：' +
      path.resolve(targetPath, pageName, pageName).replace(/\/\//g, '/')
  );
}

// 创建目标目录
function makeSourceDir() {
  const path = `${targetPath}/${pageName}`;
  const exist = fs.existsSync(path);
  if (exist) {
    log.error('', '终止执行，原因：目标目录已存在');
    return;
  }
  fs.mkdir(
    path,
    {
      recursive: true
    },
    (error) => {
      if (error) {
        throw error;
      }
      // 开始读取资源目录
      readSourceDir();
    }
  );
}

// 获取package.json文件，判断是否配置了pageTemplateDir
const packageJsonPath = getPackageJson();
if (packageJsonPath) {
  const package = require(packageJsonPath);
  if (package && package.pageTemplateConfig) {
    // 配置了路径
    if (
      package.pageTemplateConfig.pageTemplateDir &&
      !pathExists(package.pageTemplateConfig.pageTemplateDir)
    ) {
      log.error('', '配置的pageTemplateDir目录不存在，请检查!');
      return;
    } else {
      // 作者
      author = package.pageTemplateConfig.author || package.author || '';
      pageTitle = package.pageTemplateConfig.pageTitle || '';
      // 配置了模板路径
      if (package.pageTemplateConfig.pageTemplateDir) {
        sourcePath = package.pageTemplateConfig.pageTemplateDir;
      }
    }
  } else {
    author = package.author || '';
  }
}
makeSourceDir();
