// 导入第三方验证规则包
const joi = require('joi')

// 定义用户名和密码的验证规则
const id = joi.number().integer().min(1).required()
const username = joi.string().alphanum().min(2).max(11).required()
const password = joi.string().pattern(/^[\S]{4,15}$/).required()
const nickname = joi.string().required()
const email = joi.string().email().required()
const user_pic = joi.string().required()
const code = joi.number().required()


// 验证规则对象-登录表单数据
exports.check_user_login = {
    body: {
        username,
        password
    }
}

// 验证规则对象-注册表单数据
exports.check_user_register = {
    body: {
        username,
        password,
        // confirmPwd: joi.ref('password'),
        email,
        nickname,
        code
    }
}

// 验证规则对象-邮箱表单数据
exports.check_user_mail = {
    body: {
        email
    }
}

// 验证规则对象-更新用户信息
exports.check_user_msg = {
    body: {
        id,
        nickname,
        email,
        // user_pic
    }
}

// 验证规则对象—更新密码
exports.check_update_pwd = {
    body: {
        oldPwd: password,
        newPwd: joi.not(joi.ref('oldPwd')).concat(password)
    }
}

// 验证规则—更新头像
exports.check_update_avatar = {
    from: {
        avatar: joi.string().dataUri().required()
    }
}