const streamingS3 = require('streaming-s3')
const {createObjectIdString} = require('../../util/addObjectIdsToArray')
const {get} = require('request')
const {lookup} = require('mime-types')
require('dotenv').config()

const uploadUrlToS3 = (url) => new Promise((resolve, reject) => {
    const rStream = get(url)
    rStream.once('response', res => {
        console.log(res.headers)
    })
    const type = lookup(url)

    const awsCredentials = {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION
    }

    const awsConfiguations = {
        Bucket: process.env.AWS_BUCKET,
        Key: createObjectIdString()
    }


    const uploader = new streamingS3(
        rStream,
        awsCredentials,
        awsConfiguations,
        {
            concurrentParts: 2,
            waitTime: 10000,
            retries: 1,
            maxPartSize: 10 * 1024 * 1024
        }
    )
    uploader.on('finished', function (resp, stats) {
        console.log('Upload finished: ', resp)
        console.log('Upload finished: ', stats)
        resolve({resp, stats})
    })

    uploader.on('error', function (e) {
        console.log('Upload error: ', e)
        reject(e)
    })
    uploader.begin()

})
module.exports = {uploadUrlToS3}