const {head} = require('request')

const getHead = (url) => new Promise((resolve, reject) => {
    return head(url, (err, res) => {
        if (err) {
            reject(err)
        } else {
            resolve(res.headers)
        }
    })
})

module.exports = {getHead}