const request = require('request').defaults({encoding: null})

/**
 *
 * @param url
 * @return {Promise<any>}
 */
const makeWritableStream = (url) => new Promise((resolve, reject) => {
    return request.get(url)
        .on('response', (response) => {
            resolve(response)
        })
        .on('error', e => {
            reject(e)
        })
})

module.exports = {makeWritableStream}