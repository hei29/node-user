const mysql = require('mysql')

const db = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '404notfound',
    database: 'x_sql'
})

// 
// const awaitDB = (callback) => {
//     return new Promise((resolve, reject) => {
//         callback(resolve)
//     })
// }

module.exports = db