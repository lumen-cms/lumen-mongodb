import test from 'ava'

import {staticToken, graphqlRequest} from '../../util/graphqlRequest'
import {createFileGql, deleteFileGql, findFilesGql, updateFileGql} from '../../util/fileGqlStatements'
import {getHead} from '../../util/getHeadOfExternalUrl'

const externalImg = 'https://imgprxy.planet.training/v1/cj7r5j1a30jsl0132374v5q2z/cjakqo3tc00gl01376u0mbx15'


test.serial('CRUD on file collection', async t => {
    const headers = await getHead(externalImg)
    const data = {
        url: externalImg,
        key: 'adfasfas',
        name: 'test-img',
        size: headers['content-length'],
        width: 200,
        height: 200,
        contentType: headers['content-type']
    }
    // create
    const {createFile} = await graphqlRequest(createFileGql, {data}, staticToken.moderator)
    // update
    const {findFiles} = await graphqlRequest(findFilesGql, {where: {id: createFile.insertedId}}, staticToken.moderator)
    const {updateFile} = await graphqlRequest(updateFileGql, {
        where: {id: createFile.insertedId},
        data: Object.assign({}, data, {name: 'new-name-img'})
    }, staticToken.moderator)
    const updatedFiles = await graphqlRequest(findFilesGql, {where: {id: createFile.insertedId}}, staticToken.moderator)
        .then(r => r.findFiles)
    // delete
    const {deleteFile} = await graphqlRequest(deleteFileGql, {where: {id: createFile.insertedId}}, staticToken.moderator)

    const firstCreateFile = findFiles[0]
    delete firstCreateFile.id
    data.size = Number(data.size)
    t.is(typeof createFile.insertedId, 'string')
    t.is(deleteFile.deletedCount, 1)
    t.is(findFiles.length, 1)
    t.deepEqual(firstCreateFile, data)
    t.is(updatedFiles.length, 1)
    t.is(updatedFiles[0].name, 'new-name-img')
})