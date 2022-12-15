const express = require('express')
// 导入验证表单中间件
const expressJoi = require('@escook/express-joi')
// 验证表单数据中间件 
const {
    check_user_login, 
    check_user_register,
    check_user_mail
} = require('../check/user')
// 路由回调方法
const handle = require('../router_handle/user')

const router = express.Router()

//  注册路由接口
router.post('/login', expressJoi(check_user_login), handle.login)

router.post('/register', expressJoi(check_user_register), handle.register)

router.post('/mail', handle.mail)
// , expressJoi(check_user_mail)
module.exports = router