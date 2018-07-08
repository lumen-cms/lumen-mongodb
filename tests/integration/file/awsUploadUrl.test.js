import test from 'ava'
import {head} from 'request'
import {awsUploadUrlToS3} from '../../../src/modules/file/utils/awsS3UrlUpload'
require('dotenv').config()

const externalImg = 'https://imgprxy.planet.training/v1/cj7r5j1a30jsl0132374v5q2z/cjakqo3tc00gl01376u0mbx15'

const getHead = (url) => new Promise((resolve, reject) => {
    return head(url, (err, res) => {
        if (err) {
            reject(err)
        } else {
            resolve(res.headers)
        }
    })
})
test.serial('upload remote file with aws s3 sdk', async t => {
    const headers = await getHead(externalImg)
    const res = await awsUploadUrlToS3(externalImg)
    const data = res.data
    const newFileHeaders = await getHead(data.Location)
    t.is(!!data, true)
    t.is(typeof data.Location, 'string')
    t.is(typeof data.key, 'string')
    t.is(headers['content-disposition'], newFileHeaders['content-disposition'])
    t.is(headers['content-length'], newFileHeaders['content-length'])
    t.is(headers['content-type'], newFileHeaders['content-type'])
})
