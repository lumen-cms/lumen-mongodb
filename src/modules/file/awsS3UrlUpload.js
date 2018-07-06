const AWS = require('aws-sdk')
const {makeWritableStream, getHeaderOfUrl, getRequest} = require('./urlToWritableStream')
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
 * @return {Promise<ManagedUpload.SendData>}
 */
async function awsUploadUrlToS3 (url, folder) {
    const folderPath = folder || process.env.PROJECT_ID
    const {stream, headers} = await makeWritableStream(url)
    // const header = await getHeaderOfUrl(url)
    try {
        const data = await s3.upload({
            Key: folderPath + '/' + createObjectIdString(),
            Body: stream,
            Bucket: process.env.AWS_BUCKET,
            ContentDisposition: headers['content-disposition'],
            ContentLength: headers['content-length'],
            ContentType: headers['content-type'],
            CacheControl: 'max-age=31536000'
        }).promise()
        return data
    } catch (e) {
        throw new Error(e)
    }
}

module.exports = {awsUploadUrlToS3}