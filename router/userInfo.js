const express = require('express')
const handle = require('../router_handle/userInfo')
const multer = require('multer') // 处理文件上传
const path = require('path')
// 导入验证表单中间件
const expressJoi = require('@escook/express-joi')
const { check_user_msg, check_update_pwd, check_update_avatar} = require('../check/user')
const router = express.Router()

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // 文件存储地址
        cb(null, path.join(__dirname, '../uploads/cover'))
    },
    filename: (req, file, cb) => {
        // 文件存储名称
        cb(null, file.originalname)
    }
})

const upload = multer({ 
    // 文件大小限制
    limits: {
        // 限制文件大小 5M
        fileSize: 5*1024*1024,
        // 限制文件数量
        fields: 1
    },
    // 存储位置配置
    storage,
    // 文件格式过滤
    fileFilter: (req, file, cb) => {
        const typeList = ['image/png', 'image/jpeg']
        if(typeList.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(null, false)
        }
    }
 })

// 获取用户信息
router.get('/info', handle.info)

// 获取所有可管理用户信息
router.get('/userManage', handle.userManage)

// 更新用户信息
router.post('/update', expressJoi(check_user_msg), handle.update)

// 修改密码
router.post('/updatePwd', expressJoi(check_update_pwd), handle.updatePwd)

// 更换头像
router.post('/updateAvatar', upload.single('avatar'), expressJoi(check_update_avatar), handle.updateAvatar)

module.exports = router