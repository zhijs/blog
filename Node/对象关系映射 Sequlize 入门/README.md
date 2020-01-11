### 对象关系映射 Sequlize 入门

### 前言
在后端服务应用中，我们常常会用到关系型数据库，但是在面向对象的语言代码逻辑里，数据都是用对象的形式表示的，所以当操作数据库的时候，需要将内存的对象序列化后存储到数据库中，或者在读取数据库数据的时候，需要将读取的数据反序列化为对象，而这种就面向对象与关系数据库互不匹配的现象使得开发和维护变得更加困难，而 对象关系映射（Object Relational Mapping，简称ORM）就是解决这种问题的技术，ORM 通过一个中间层将程序中的对象自动持久化到关系数据库中，本文我们就来学习一下基于 Promise 的对象映射框架 Sequelize，本文主要包含以下几部分内容：

- Sequelize 介绍
- koa + Sequlize + MySql 表的增删改查
- koa + Sequlize + MySql 
- 总结


### Sequelize 介绍
>引用官网介绍
>> Sequelize 给 Node.js v4 版本之上 提供的一个基于 Promise 的对象关系映射技术的库，同时，也支持  PostgreSQL，MySQL，SQLite，MSSQL 等数据库，支持事务，表关联，读复制等功能。

可见在 Node.js 环境中使用 Sequelize 是再自然不过的事了，接下来就通过一些简单的例子来学习一个  Sequelize 的使用。


### koa + Sequlize + MySql 单表的增删改查
注意： 这里省略了 MySql 的安装和配置

#### 1. 数据库链接
第一步，对设置数据库的配置

```javascript
/*
* config/db.js
*/
module.exports = {
  name: 'test', // 数据库名称，
  username: 'root', // 用户名,
  password: '123456', // 密码
  option: {
    host: 'localhost',
    dialect: 'mysql', // 数据库类型
    pool: { // 连接池配置
      max: 5, // 数据库连接池最大数
      min: 0, //  数据库连接池最小数
      idle: 10000, // 在释放连接之前允许空闲的最大毫秒数
      acquire: 30000 // 在抛出错误之前允许获取连接的最大时长(毫秒)
    }    
  }
}
```

第二步，引入相关库 (Koa, Sequlize), 实例化 sequlize 并传入配置

```javascript
/*
* db/index.js
*/
const Sequelize = require('sequelize');
const dbConf = require('../config/db')
module.exports = new Sequelize(dbConf.name, dbConf.username, dbConf.password, dbConf.option);

```

#### 2. 定义数据模型
定义数据模型，就是创建一个 MySql 的数据表，例如下面定义了一个 student 的表：

```javascript
/*
* model/student.js
*/
module.exports = (sequelize, DataTypes) => {
    /**
     * 第一个参数 String: 表的名称
     * 第二个参数 Object: 表中每一行的数据项,每个属性代表一列数据
     * 第三个参数 Object: 额外的配置
     */
    return sequelize.define('student', {
      name: {
        type: DataTypes.STRING(50), // 定义类型(长度)
        allowNull: false // 是否允许为 NULL
      },
      number: {
        type: DataTypes.INTEGER(5), // 定义类型(长度)
        allowNull: false, // 是否允许为 NULL
        unique: true // 是否是唯一的
      },
      age: {
        type: DataTypes.INTEGER(3), // 定义类型(长度)
        allowNull: false, // 是否允许为 NULL
        default: 1 // 默认值
      }, 
      class: {
        type: DataTypes.INTEGER(3), // 定义类型(长度)
        allowNull: false, // 是否允许为 NULL
        default: 1 // 默认值   
      }
    })
  }
```
Sequlize 提供了很多种数据类型的选择，但是有些数据类型是特定数据库才能使用的，比如 Array 数组类型就只有 Postgres 才可以使用，Sequlize 详细的数据类型描述可戳[这里](https://sequelize.org/v4/variable/index.html#static-variable-DataTypes)

#### 3. 创建同步表到数据库
上文只是定义了数据表的模型，但并未在数据库中创建表，接下来创建数据表：

```javascript
/*
* model/index.js
*/
const sequlize = require('../db/index')

// 导入模型
const student = sequlize.import('./student')

// 同步模型到数据库，即是创建一个 表
sequlize.sync()

// 导出模型
exports.student = student 
```
在执行上述的操作后，test 数据库中就会生成一个 student 数据表，如果下图所示：

![student 数据表](https://github.com/zhijs/blog/raw/master/Node/%E5%AF%B9%E8%B1%A1%E5%85%B3%E7%B3%BB%E6%98%A0%E5%B0%84%20Sequlize%20%E5%85%A5%E9%97%A8/images/student-table.png)

上图中 createAt 和 updateAt 是 Sequlize 默认添加的字段，我们可以在配置 model 的时候可以选择去掉。

#### 4. 数据增删改查
有了数据表后，我们可以用 model 对数据表进行增删改查的操作了

```javascript
/*
* router/student.js
*/
const models = require('../model/index')
const student = models.student

// 增
router.post('/student/add', async(ctx, next) => {
  const { name, number, age, classNumber } = ctx.request.body
  let ret
  let error 
  try {
    ret = await student.create({
      name,
      number,
      age,
      classNumber
    })
  }catch(e) {
    error = e.error
  }
  if (ret) {
    ctx.body = {
      code: 0,
      data: ret  
    }
  } else {
    ctx.body = {
      code: -1,
      data: error  
    }
  }
})

// 改
router.post('/student/update/:id', async(ctx, next) => {
  const keys = ['name', 'number', 'age', 'classNumber']
  const id = ctx.params.id
  let obj = {}
  keys.map((key) => {
    if (ctx.request.body[key] !== undefined) {
      obj[key] = ctx.request.body[key]
    }
  })
  let ret
  let error 
  try {
    ret = await student.update(obj, {
      where: {
        id 
      }
    })
  }catch(e) {
    error = e.error
  }
  if (ret) {
    ctx.body = {
      code: 0,
      data: ret  
    }
  } else {
    ctx.body = {
      code: -1,
      data: error  
    }
  }
})
// 省略删查

```
接下来我们用 curl 测试一下我们的接口：

```bash
 curl -d 'name=lili&number=1&age=16&classNumber=1' -X POST http://localhost:9003/student/add

```
其返回如下：  

![数据插入](./images/insert-student.https://github.com/zhijs/blog/raw/master/Node/%E5%AF%B9%E8%B1%A1%E5%85%B3%E7%B3%BB%E6%98%A0%E5%B0%84%20Sequlize%20%E5%85%A5%E9%97%A8/images/insert-student.png)  


查询数据表 student 结果如下：

![数据插入](https://github.com/zhijs/blog/raw/master/Node/%E5%AF%B9%E8%B1%A1%E5%85%B3%E7%B3%BB%E6%98%A0%E5%B0%84%20Sequlize%20%E5%85%A5%E9%97%A8/images/select-insert-state.png)

其他删改查类似。

上述只讲述了单表的操作，但是在工作中，我们常常需要多变联合操作，下面我们来看看，Sequlize 如何进行多表联合操作。

### koa + Sequlize + MySql 关联表的增删改查

假设每个学生需要记录自己所学的课程信息，学生和课程之间的关心为 1:N, 一个学生可能选了很多课，也可能一门课也没有，所以最好的办法是将课程作为一个单独的表，然后和学生关联起来。

首先让我们来理解一个概念： 

- 外键  
外键就是表中存在一个字段指向另外一个表的主键，那么这个字段就可以称为外键。

假设有个学生表 (students tabel) 如下：  

|id     |姓名  | 班级| 学号|
|:------|:-----|:------|:------|
|1    |lili    | 2|202001|
|2   |xixi|3|202002|

而每个学生有自己的选课情况，选课表 (subject) 如下：

|id|选课学生 id|课程名称|
|:------|:------|:------|
|1  |1  |math  |
|2 | 1 | english|
|3|1|chinese|
|4|2|chinese|
|5|2|physics|  


对于第二个表 subject 来说，选课学生 id 就是外键，其是和学生表中的 id 相关联的值，可以通过这个键在学生表中查询这个选课记录对应的学生。我们称 student 表为主表，subject 表为从表，一般而言，外键通常关联的是主表的主键或者设置了unique 的字段的项。

接下来我们通过一个例子来学习数据表的关联操作。

#### 1. 新增数据模型 subject

```javascript
/*
* model/subject.js
*/
module.exports = (sequelize, DataTypes) => {
    return sequelize.define('subject', {
      name: {
        type: DataTypes.STRING(50), // 定义类型(长度)
        allowNull: false // 是否允许为 NULL
      }
    })
  }
```

#### 2. 定义表之间的关联关系

```javascript
/*
* model/index.js
*/
const sequlize = require('../db/index')

// 导入模型
const student = sequlize.import('./student')
const subject = sequlize.import('./subject')

// 关联 student subject 表
student.hasMany(subject) // 会自动的将 studentId 添加到 subject 表中

// 同步模型到数据库，即是创建表
sequlize.sync()

// 导出模型
exports.student = student 
```

#### 3.关联表的操作
我们修改上述单表操作的代码，增加关联表操作的逻辑

```javascript
/*
* router/student.js
*/
router.post('/student/add', async(ctx, next) => {
  const { name, number, age, classNumber, subjects } = ctx.request.body
  let ret
  let error 
  try {
    ret = await student.create({
      name,
      number,
      age,
      classNumber,
      subjects // 注意这里属性是复数形式 
    }, {
      include: [ models.subject ]  
    })
  }catch(e) {
    error = e
  }
  if (ret) {
    ctx.body = {
      code: 0,
      data: ret  
    }
  } else {
    ctx.body = {
      code: -1,
      data: error  
    }
  }
})
```

我们用 curl 测试一下接口：

```bash
curl -X POST \
  http://localhost:9003/student/add \
  -d '{
 "name": "hhh1",
 "age": 12,
 "number": 7,
 "classNumber": 3,
 "subjects": [{"name": "math"}, {"name": "chinese"}]
}'
```
查看 subject 数据库如下：  

![关联表插入查询](https://github.com/zhijs/blog/raw/master/Node/%E5%AF%B9%E8%B1%A1%E5%85%B3%E7%B3%BB%E6%98%A0%E5%B0%84%20Sequlize%20%E5%85%A5%E9%97%A8/images/relation-subject.png)

注意上述的代码，插入数据的时候，subject 数据的属性键名必须是复数,值必须是数组，因为关联的时候是使用 student.hasMany(subject) 关联的，Sequlize 内部使用 inflection-js 将 subject 转化为复数最为关联表数据传入的属性名称。

例如上述创建部分代码如果改成：

```javascript
  ret = await student.create({
      name,
      number,
      age,
      classNumber,
      subjectes: subjects // 注意这里属性是复数形式 
    }, {
      include: [ models.subject ]  
    })
```
则无法将关联 subjects 数据插入到 subject 表中，对于这种易错的使用方式，Sequlize 提供了手动命名的方式，这里暂且不讲。


下面我们再来看看关联表的删除

首先为了方便测试，我们在 subject 表中多插入几条数据:

![subject 表](https://github.com/zhijs/blog/raw/master/Node/%E5%AF%B9%E8%B1%A1%E5%85%B3%E7%B3%BB%E6%98%A0%E5%B0%84%20Sequlize%20%E5%85%A5%E9%97%A8/images/subject-more.png)  

接着，我们在主表中删除 studentId 为 12 的数据

```bash
 curl -X DELETE http://localhost:9003/student/delete?id=12
```
然后你会发现，subject 表中 studentId 对应为 12 个数据项都被设置为了 NULL, 其实这个是 MySql 关联表删除主表时，Sequlize 设置的从表的默认表现。

在 MySql 中，在父表上进行update/delete以更新或删除在子表中有一条或多条对应匹配行的候选键时，父表的行为取决于：在定义子表的外键时指定的on update/on delete子句，其有四种表现形式： 


|关键字| 含义 |
|:------|:------|
|CASCADE|删除包含与已删除键值有参照关系的所有记录|
|SET NULL|修改包含与已删除键值有参照关系的所有记录，使用NULL值替换(只能用于已标记为NOT NULL的字段)|
|RESTRICT|拒绝删除要求，直到使用删除键值的辅助表被手工删除，并且没有参照时(这是默认设置，也是最安全的设置)|
|NO ACTION|啥也不做|  

所以，如果我们想在删除主表的时候，对应从表中相关的数据也删除的话，可以成如下删除方式：  

```javascript
/*
* router/student.js
*/
router.delete('/student/delete', async(ctx, next) => {
  const id = ctx.query.id
  let ret
  let error 
  try {
    ret = await student.destroy({
      cascade: true, // 同时删除从表
      where: {
        id  
      }
    })
  }catch(e) {
    error = e
  }
  if (ret) {
    ctx.body = {
      code: 0,
      data: ret  
    }
  } else {
    ctx.body = {
      code: -1,
      data: error  
    }
  }
})
```
另外还需要更改关联时的配置：

```javascript
/*
* model/index.js
*/

// 关联 student subject 表时，要设置 外键为 allowNull 为 false
student.hasMany(subject, {foreignKey : {name: 'studentId', allowNull: false}})
```
删除后就需要重新创建 subjects 数据表：

```bash
drop table subjects
```
下面是从表删除前的数据图：  

![删除前](https://github.com/zhijs/blog/raw/master/Node/%E5%AF%B9%E8%B1%A1%E5%85%B3%E7%B3%BB%E6%98%A0%E5%B0%84%20Sequlize%20%E5%85%A5%E9%97%A8/images/delete-before.png)  


执行 curl 删除主表 id 为 37 的数据：

```bash
curl -X DELETE http://localhost:9003/student/delete?id=37
```

删除后 subjects 从表数据结果为：  
![删除后](https://github.com/zhijs/blog/raw/master/Node/%E5%AF%B9%E8%B1%A1%E5%85%B3%E7%B3%BB%E6%98%A0%E5%B0%84%20Sequlize%20%E5%85%A5%E9%97%A8/images/escape-after-delete.png)   

可见从表里面的数据也被删除了。

需要注意的时，只有从表的完全只依附于主表的时候，才能执行这样的关联删除操作。


而对于更新的操作，如何需要更新从表的数据话，可以直接对从表进行操作:

```javascript
 ret = await subject.update(subjectObj, {
  where: {
    id 
  }
})
```



#### 总结
本文对于 Sequlize 做了简单的介绍，以及结合例子还实现简单的 CRUD 操作,当然，在实际的工作中，其场景远远比这个例子复杂。 Sequlize 就是一个中间层，将我们通过面向对象的代码转化为一条条的 Sql 语句。通过 Squlize, 我们能更好更直观的对数据库进行操作，但是也会带了一部分的学习成本。


附录：  
[Sequlize 支持的数据类型（取决于使用的数据库）](https://sequelize.org/v4/class/lib/model.js~Model.html#static-method-init)
[demo 完整代码](https://github.com/zhijs/example/tree/master/koa-sequlize-mysql-demo)





