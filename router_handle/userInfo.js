const db = require('../db')
// 导入加密模块
const bcrypt = require('bcryptjs')
const path = require('path')

// 获取用户信息
const info = (req, res) => {
    const { id } = req.auth
    const searchStr = 'select * from users where id=?'
    db.query(searchStr, id, (err, results) => {
        if (err) return res.out(err)
        if (results.length === 1) {
            return res.send({
                status: 200,
                data: results[0]
            })
        } 
        res.out('用户信息获取失败')
    })
}

// 更新用户信息
const update = (req,res) => {
    const updateStr = 'update users set ? where id=?'
    db.query(updateStr, [req.body, req.body.id], (err,results) => {
        if(err)  return res.out(err)
        if(results.affectedRows === 1) {
            const searchStr = 'select * from users where id=?'
            db.query(searchStr, req.body.id, (err2, results2) => {
                if(err) return res.out(err2)
                if(results2.length === 1) {
                    return res.send({
                        status: 200,
                        msg: '修改成功',
                        data: results2[0]
                    })
                }
                res.out('修改失败')
            })
        } else {
            res.out('修改失败')
        }
    })
}

// 修改密码
const updatePwd = (req,res) => {
    const {oldPwd, newPwd} = req.body
    const {id} = req.auth
    const searchStr = 'select * from users where id=?'
    db.query(searchStr, id, (err, results) => {
        if(err) return res.out(err)
        if(results?.length === 1) {
            const {password: sqlPwd} = results[0]
            const isPwd = bcrypt.compareSync(oldPwd, sqlPwd)
            console.log(oldPwd, isPwd)
            if(isPwd) {
                const changePwd = bcrypt.hashSync(newPwd, 10)
                const updateStr = 'update users set password=? where id=?'
                db.query(updateStr, [changePwd, id], (err2, results2) => {
                    if(err2) return res.out(err2)
                    if(results2.affectedRows === 1) return res.out('修改成功', 200)
                    return res.out('密码修改失败')
                })
            } else {
                res.out('密码错误')
            }
        } else {
            res.out('用户不存在')
        }
    })
}

// 更换头像
const updateAvatar = (req,res) => {
    const {originalname} = req.file
    const avatar = path.join('/uploads/cover/', originalname)
    const {id} = req.auth
    const str = 'update users set user_pic=? where id=?'
    db.query(str, [avatar, id], (err,results) => {
        if(err) return res.out(err)
        if(results.affectedRows === 1) return res.out('更换成功', 200)
        res.out('更换失败')
    })
}

module.exports = {
    info,
    update,
    updatePwd,
    updateAvatar
}