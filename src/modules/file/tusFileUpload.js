const makeWritableStream = require('./urlToWritableStream').makeWritableStream
const {Upload} = require('tus-js-client')
/**
 *
 * @param file
 * @param size
 * @return {Promise<any>}
 */
const uploadFileWithTus = (file = null) => new Promise(async (resolve, reject) => {
    let size = null
    let stats = null
    if (!file) {
        reject('required options missing')
    }

    if (typeof file === 'string' && file.includes('http')) {
        file = await makeWritableStream(file)
    }


    const options = {
        endpoint: 'http://localhost:8000',
        resume: true,
        metadata: {
            filename: 'sample-filename'
        },
        onError: function (error) {
            console.log(error)
            reject(error)
        },
        onProgress: function (bytesUploaded, bytesTotal) {
            var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
            console.log(bytesUploaded, bytesTotal, percentage + '%')
        },
        onSuccess: function () {
            console.log('Upload finished:', uploader.url)
            resolve(uploader.url)
        }
    }
    size && (options.uploadSize = size)
    const uploader = new Upload(file, options)
    uploader.start()
})

module.exports = {uploadFileWithTus}