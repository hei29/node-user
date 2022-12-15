const db = require('../db')
// 导入加密模块
const bcrypt = require('bcryptjs')
// 用于将用户信息生成一个jsonwebtoken的字符串
const jwt = require('jsonwebtoken')
// 导入jwt秘钥
const {jwtSecretKey} = require('../config')
const path = require('path')
const moment = require('moment')

// 随机生成6位数验证码
const createSix = require('../utils/createSixNum')
// 发送邮件
const sendMail = require('../utils/nodemailer')


const login = (req,res) => {
    const userInfo = req.body
    const {username, password} = userInfo
    const getUser = 'select * from users where username=?'
    db.query(getUser, username, (err, results) => {
        if(err) return res.out(err)
        if(results.length> 0) {
            const sqlPwd = results[0].password
            const compareResult = bcrypt.compareSync(password, sqlPwd) 
            if (compareResult) {
                const user = {...results[0], password: '', user_pic: ''}
                const token = jwt.sign(user, jwtSecretKey, {expiresIn: '2d'})
                return res.send({
                    status: 200,
                    msg: '登录成功',
                    data: {
                        ...results[0],
                        token: 'Bearer ' + token
                    }
                })
            }
            res.out('密码错误')
        } else {
            return res.out('未注册的账号')
        }
    })
}

const register = (req,res) => {
    const userinfo = req.body
    const { username, password, code } = userinfo  
    // 用户名查重 
    const searchUser = 'SELECT username from users WHERE username=?'
    new Promise((resolve, reject) => {
        db.query(searchUser,username, (err, results) => {
            if(err) return res.out(err)
            if (results.length > 0) return res.out('用户名被占用')
            else {
                // 用户名可以使用, 验证验证码是否正确
                resolve()
            }
        })
    }).then(() => {
        const seCode = 'select * from users where code = ?'
        db.query(seCode, code, (err, results) => {
            if(err) return res.out(err)
            if (results.length = 0) return res.out('验证码错误')
            // 对密码进行加密， 返回加密后的字符串
            userinfo.password = bcrypt.hashSync(password, 10)
            // 用户默认头像
            userinfo.user_pic = path.join('/uploads/cover/404.jpg')
            userinfo.code = 0
            userinfo.account_create_time = moment().valueOf()

            const addUser = 'update users set ? where code = ?'
            db.query(addUser, [userinfo, code], (err2, results2) => {
                if(err2) return res.out(err2)
                if(results2.affectedRows === 1) {
                    res.out('注册成功', 200)
                    // 在服务器端生成token字符串
                }
                else res.out('写入数据库失败')
            })
        })
        
    })
}

// 发送邮箱验证码
const mail = (req, res) => {
    // 查询是否有注册到一半的邮箱(指邮箱存入数据库但账号没存入数据库)
    const registerd = 'select * from users where email is not null and account_create_time is null'
    new Promise((resolve, reject) => {
        db.query(registerd, (err, results) => {
            console.log(results);
            if(err) return res.out(err)
            if(results.length>0){
                const {id} = results[0]
                // 删除注册到一半的邮箱
                const delRegisterd = 'delete from users where id = ?'
                db.query(delRegisterd, id, (err2, results2) => {
                    if(err2) res.out(err2)
                    if(results2.affectedRows !== 1) {
                        res.out('该邮箱暂不能注册，请联系管理员')
                    }
                    console.log('邮箱已删除');
                    resolve()
                })
            } else {
                resolve()
            }
        })
    }).then(() => {
        // 判断邮箱是否已注册
        const code = createSix()
        const {email} = req.body
        const cnkiStr = 'select * from users where email=?'
        db.query(cnkiStr, email, (err, results) => {
            if(err) return res.out(err)
            if(results.length>0) return res.out('邮箱已存在')
            const code_create_time = moment().valueOf()
            let mailContent = {
                // 发件人邮箱
                from: 'xyt4043@163.com',
                // 主题
                subject: '验证码',
                // 收件人邮箱
                to: email,
                // 邮件内容，html格式
                text: code + ' 这是你的验证码,有效期为10分钟'
            }
            // 将邮箱验证码等存入数据库
            const saveCode = 'insert into users set ?'
            new Promise((resolve, reject) => {
                db.query(saveCode, {email, code, code_create_time}, (err2, results2) => {
                    if(err2) return res.out(err2)
                    if(results2.affectedRows !== 1) {
                        res.out('验证码发送失败')
                    }
                    resolve()
                })
            }).then(() => {
                sendMail(mailContent,res)
            })
        })

    }) 
}


module.exports = {
    login,
    register,
    mail
}