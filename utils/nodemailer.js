const nodemailer = require('nodemailer')

// 创建一个smtp服务器
const config = {
    host: 'smtp.163.com',
    port: 465,
    auth: {
        user: 'xyt4043@163.com',
        pass: 'RWLDNYCNMKBNBUGA' // 邮箱授权码
    }
}

// 创建一个smtp客户端对象
const transporter = nodemailer.createTransport(config)

// 发送邮件
module.exports = (mail, res) => {
    transporter.sendMail(mail, (err, info) => {
        if(err) return res.out(err)
        console.log(info.response)
        res.send({
            msg: '验证码已发送',
            status: 200,
            code: info.messageSize
        })
    })
}