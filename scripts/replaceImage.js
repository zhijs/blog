/**
 * 替换图片相对路径为 cdn 地址
 */

const fs = require('fs')
const path = require('path')
const url = require('url')
class TransForm {
  constructor () {
    this.cndPath = require('../package.json').githubCdnPath
  }


  // 解析命令参数 npm run build path
  parseCommand () {
    const args = process.argv
    const scriptPath = process.cwd()
    console.log('relativePath---', args[2])
    return {
      rootPath: path.resolve(scriptPath, '..'),
      relativePath: args[2]    
    }
  }

  // 替换地址
  replacePath ({rootPath, relativePath }) {
    const filePath = path.join(rootPath, relativePath, 'README.md')
  
    const content = fs.readFileSync(filePath, {
      encoding: 'utf-8'
    })
    let _content = content.replace(/\!\[\]\((\.+.+)\)/g, (match, p1) => {
      
      const _p1 = `![](${url.format(path.normalize(path.join(this.cndPath, relativePath, p1)))})`
      return _p1
    })
    fs.writeFileSync(filePath, _content)
  }
  run () {
    this.replacePath(this.parseCommand())
  }
}

const trans = new TransForm()
trans.run()

