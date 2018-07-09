const AWS = require('aws-sdk')
const {makeWritableStream} = require('./urlToWritableStream')
const {createObjectIdString} = require('../../../util/addObjectIdsToArray')
const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})


/**
 *
 * @param url
 * @return {Promise<{data: ManagedUpload.SendData, dimensions: (Object|*)}>}
 */
async function awsUploadUrlToS3 (url) {
    const {stream, headers, dimensions} = await makeWritableStream(url)

    try {
        const data = await s3.upload({
            Key: createObjectIdString(),
            Body: stream,
            Bucket: process.env.AWS_BUCKET,
            ContentDisposition: headers['content-disposition'],
            ContentLength: headers['content-length'],
            ContentType: headers['content-type'],
            CacheControl: 'max-age=31536000'
        }).promise()
        return {data, dimensions}
    } catch (e) {
        throw new Error(e)
    }
}

async function deleteFilesFromS3 (keys) {
    try {
        const options = {
            Bucket: process.env.AWS_BUCKET,
            Delete: {
                Objects: keys.map(i => ({Key: i}))
            }
        }
        const data = await s3.deleteObjects(options).promise()
        return data
    } catch (e) {
        throw new Error(e)
    }
}

module.exports = {awsUploadUrlToS3, deleteFilesFromS3}