import test from 'ava'

require('dotenv').config()
import {awsUploadUrlToS3} from '../../../src/modules/file/awsS3UrlUpload'

const externalImg = 'https://imgprxy.planet.training/v1/cj7r5j1a30jsl0132374v5q2z/cjakqo3tc00gl01376u0mbx15'

test.serial('upload remote file with aws s3 sdk', async t => {
    const data = await awsUploadUrlToS3(externalImg)
    t.is(!!data, true)
    t.is(typeof data.Location, 'string')
    t.is(typeof data.key, 'string')
})