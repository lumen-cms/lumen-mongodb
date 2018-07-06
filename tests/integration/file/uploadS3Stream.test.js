import test from 'ava'
import {uploadUrlToS3} from '../../../src/modules/file/s3StreamingUpload'

const externalImg = 'https://imgprxy.planet.training/v1/cj7r5j1a30jsl0132374v5q2z/cjakqo3tc00gl01376u0mbx15'

test.serial('upload remote file with tus endpoint', async t => {
    const data = await uploadUrlToS3(externalImg)

    t.is(!!data, true)
})