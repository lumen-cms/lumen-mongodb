import test from 'ava'
import {awsUploadUrlToS3, deleteFilesFromS3} from '../../../src/modules/file/utils/awsS3UrlUpload'
import {getHead} from '../../util/getHeadOfExternalUrl'

require('dotenv').config()

const externalImg = 'https://imgprxy.planet.training/v1/cj7r5j1a30jsl0132374v5q2z/cjakqo3tc00gl01376u0mbx15'


test.serial('upload remote file with aws s3 sdk', async t => {
    const headers = await getHead(externalImg)
    const res = await awsUploadUrlToS3(externalImg)
    const data = res.data
    const newFileHeaders = await getHead(data.Location)
    const deletedFiles = await deleteFilesFromS3([data.key])
    t.is(deletedFiles.Deleted.length, 1)
    t.is(!!data, true)
    t.is(typeof data.Location, 'string')
    t.is(typeof data.key, 'string')
    t.is(headers['content-disposition'], newFileHeaders['content-disposition'])
    t.is(headers['content-length'], newFileHeaders['content-length'])
    t.is(headers['content-type'], newFileHeaders['content-type'])
})
