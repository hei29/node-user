module.exports = () => {
    let i = 1
    let code = ''
    while(i<=6) {
        i++;
        code += Math.floor(Math.random() * 10)
    }
    return code
}