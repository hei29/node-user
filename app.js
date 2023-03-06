const express = require('express')
const joi = require('joi')
// 用于将jsonwebtoken字符串解析成用户信息
const {expressjwt} = require('express-jwt')
const path = require('path')

const cors = require('cors')

// 导入用户登录注册模块
const userRouter = require('./router/user')
// 导入用户信息模块
const userInfoRouter = require('./router/userInfo')

// 导入jwt秘钥
const {jwtSecretKey} = require('./config')


const app = express()

// 允许跨域
app.use(cors())

// 托管静态资源
app.use('/uploads', express.static(path.join(__dirname, './uploads')))
// app.use('/AzurLanne', express.static('/home/public/AzurLanne'))  // 线上放开

// 配置解析表单数据中间件
app.use(express.json())
app.use(express.urlencoded({extended: false}))

// 封装res.send()
app.use((req,res,next) => {
    res.out = (msg, status = -1) => {
        res.send({
            status,
            msg: msg instanceof Error ? msg.message : msg
        })
    }
    next()
})

// 创建一个将jwt字符串解析还原成json对象的全局中间件
// secret 解密秘钥
// unless 配置不需要访问权限的接口
// 注意：express-jwt配置成功后，会把解析出来数据挂载到req.auth上
app.use(expressjwt({
    secret: jwtSecretKey,
    algorithms: ['HS256'],
    credentialsRequired: true // 设置为false就关闭校验
}).unless({path: [/^\/api\/user\//]}))

// 注册用户路由
app.use('/api/user', userRouter)
app.use('/api/userMsg', userInfoRouter)



// 定义错误中间件
app.use((err, req, res, next) => {
    // 数据验证失败
    if(err instanceof joi.ValidationError) return res.out(err)
    // 身份认证失败错误
    if (err.name === 'UnauthorizedError') return res.out('身份认证失败')
    console.log('其他的错误' + err)
    // 其他错误
    return res.out(err)
})

app.listen(4043, () => {
    console.log('http://127.0.0.1:4043')
})