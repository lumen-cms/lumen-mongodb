const {get} = require('request').defaults({encoding: null})
const probe = require('probe-image-size')
/**
 *
 * @param url
 * @return {Promise<{stream:any,headers:object,dimensions:object}>}
 */
const makeWritableStream = (url) => new Promise((resolve, reject) => {
    return get(url, (err, res) => {
        if (err) {
            reject(err)
        } else {
            const dimensions = probe.sync(res.body)
            resolve({stream: res.body, headers: res.headers, dimensions})
        }
    })
})
// const getHeaderOfUrl = (url) => new Promise((resolve, reject) => {
//     return request.head(url, (err, res) => {
//         if (err) {
//             reject(err)
//         } else {
//             resolve(res.headers)
//         }
//     })
// })
//
// const getRequest = (url) => request.get(url)

module.exports = {makeWritableStream}