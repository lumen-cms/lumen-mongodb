const request = require('request').defaults({encoding: null})

/**
 *
 * @param url
 * @return {Promise<any>}
 */
const makeWritableStream = (url) => new Promise((resolve, reject) => {
    return request.get(url, (err, res) => {
        if (err) {
            reject(err)
        } else {
            resolve({stream: res.body, headers: res.headers})
        }
    })
})
const getHeaderOfUrl = (url) => new Promise((resolve, reject) => {
    return request.head(url, (err, res) => {
        if (err) {
            reject(err)
        } else {
            resolve(res.headers)
        }
    })
})

const getRequest = (url) => request.get(url)

module.exports = {getRequest, makeWritableStream, getHeaderOfUrl}