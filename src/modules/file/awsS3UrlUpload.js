const AWS = require('aws-sdk')
const {makeWritableStream} = require('./urlToWritableStream')
const {createObjectIdString} = require('../../util/addObjectIdsToArray')
const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

/**
 *
 * @param url
 * @param folder
 * @return {Promise<any>}
 */
const awsUploadUrlToS3 = (url, folder) => new Promise(async (resolve, reject) => {
    const folderPath = folder || process.env.PROJECT_ID
    const stream = await makeWritableStream(url)
    s3.upload({
        Key: folderPath + '/' + createObjectIdString(),
        Body: stream,
        Bucket: process.env.AWS_BUCKET
    }, {}, (err, data) => {
        if (err) {
            reject(err)
        } else {
            resolve(data)
        }
    })

})

module.exports = {awsUploadUrlToS3}