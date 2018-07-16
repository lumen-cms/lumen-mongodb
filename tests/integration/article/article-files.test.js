import test from 'ava'
import _pick from 'lodash.pick'
import {CollectionNames} from '../../../src/mongo/enum'
import {staticToken, graphqlRequest} from '../../util/graphqlRequest'


const oneData = {
    title: 'Test Title',
    slug: 'test/123',
    languageKey: 'de',
    description: 'This is a very long description',
    metaTitle: 'Meta Title',
    deleted: false,
    published: true
}
const externalImg = 'https://imgprxy.planet.training/v1/cj7r5j1a30jsl0132374v5q2z/cjakqo3tc00gl01376u0mbx15'
const manyData = {
    url: externalImg,
    key: 'adfasfas' + new Date().toISOString(),
    name: 'test-img',
    size: 123456,
    width: 200,
    height: 200,
    contentType: 'image/png'
}

const oneMutation = {
    name: CollectionNames.articles,
    create: require('../../util/articleGqlStatements').createArticleGql,
    update: require('../../util/articleGqlStatements').updateArticleGql,
    delete: require('../../util/articleGqlStatements').deleteArticleGql,
    find: require('../../util/articleGqlStatements').findArticlesGql
}

const manyMutation = {
    name: CollectionNames.files,
    create: require('../../util/fileGqlStatements').createFileGql,
    update: require('../../util/fileGqlStatements').updateFileGql,
    delete: require('../../util/fileGqlStatements').deleteFileGql,
    find: require('../../util/fileGqlStatements').findFilesGql
}

test.serial('create article with preview image and update image name and delete article', async t => {
    oneData.slug = oneData.slug + new Date().toISOString()
    manyData.key = manyData.key + new Date().toISOString()
    const manyCreateMutation = await graphqlRequest(manyMutation.create, {data: manyData}, staticToken.moderator)
        .then(r => r[manyMutation.name + 'CreateOne'])
    const manyMutationInsertedId = manyCreateMutation.insertedId
    manyData.id = manyMutationInsertedId
    const testDataOne = Object.assign(oneData, {
        previewImage: _pick(manyData, ['id', 'url', 'name', 'width', 'height', 'key'])
    })
    const oneCreateMutation = await graphqlRequest(oneMutation.create, {data: testDataOne}, staticToken.moderator)
        .then(r => r[oneMutation.name + 'CreateOne'])


    const oneMutationInsertedId = oneCreateMutation.insertedId
    const findOneStep1 = await graphqlRequest(oneMutation.find, {where: {id: {EQ: oneMutationInsertedId}}})
        .then(r => r[oneMutation.name])

    const findManyStep1 = await graphqlRequest(manyMutation.find, {where: {id: {EQ: manyMutationInsertedId}}}, staticToken.moderator)
        .then(r => r[manyMutation.name])

    // update many

    const updateManyName = 'new-many-name'
    const upateManyData2 = Object.assign({}, manyData, {name: updateManyName})
    delete upateManyData2.id
    const updateManyStep2 = await graphqlRequest(manyMutation.update, {
        where: {id: manyMutationInsertedId},
        data: upateManyData2
    }, staticToken.moderator)
        .then(r => r[manyMutation.name + 'UpdateOne'])

    const findOneStep2 = await graphqlRequest(oneMutation.find, {where: {id: {EQ: oneMutationInsertedId}}})
        .then(r => r[oneMutation.name])

    const deleteOneMutation = await graphqlRequest(oneMutation.delete, {where: {id: oneMutationInsertedId}}, staticToken.moderator)
        .then(r => r[oneMutation.name + 'DeleteOne'])

    const findManyStep3 = await graphqlRequest(manyMutation.find, {where: {id: {EQ: manyMutationInsertedId}}}, staticToken.moderator)
        .then(r => r[manyMutation.name])

    const deleteManyMutation = await graphqlRequest(manyMutation.delete, {where: {id: manyMutationInsertedId}}, staticToken.moderator)
        .then(r => r[manyMutation.name + 'DeleteOne'])

    t.is(deleteOneMutation.deletedCount, 1)
    t.is(deleteManyMutation.deletedCount, 1)
    t.is(findOneStep1.length, 1)
    t.is(findOneStep1[0].previewImage.url, manyData.url)
    t.is(findOneStep1[0].previewImage.name, manyData.name)
    t.is(findManyStep1.length, 1)
    t.is(findManyStep1[0]._meta.articlesPreviewImages.find(i => i === oneMutationInsertedId), oneMutationInsertedId)
    t.is(findOneStep2[0].previewImage.name, updateManyName) // check if relation updated field is correct
    t.is(!!findManyStep3[0]._meta.articlesPreviewImages.find(i => i === oneMutationInsertedId), false)
})

test.serial('article and image create, then add preview image and update image name and delete image', async t => {
    oneData.slug = oneData.slug + new Date().toISOString() + 22
    manyData.key = manyData.key + new Date().toISOString() + 22
    const manyData2 = Object.assign({}, manyData)
    delete manyData2.id
    const manyCreateMutation = await graphqlRequest(manyMutation.create, {data: manyData2}, staticToken.moderator)
        .then(r => r[manyMutation.name + 'CreateOne'])
    const manyMutationInsertedId = manyCreateMutation.insertedId
    manyData.id = manyMutationInsertedId
    const testDataOne = Object.assign(oneData)
    const oneCreateMutation = await graphqlRequest(oneMutation.create, {data: testDataOne}, staticToken.moderator)
        .then(r => r[oneMutation.name + 'CreateOne'])
    const oneMutationInsertedId = oneCreateMutation.insertedId

    const testDataOne2 = Object.assign({}, testDataOne, {
        previewImage: _pick(manyData, ['id', 'url', 'name', 'width', 'height', 'key'])
    })
    const updateStep1 = await graphqlRequest(oneMutation.update, {
        where: {id: oneMutationInsertedId},
        data: testDataOne2
    }, staticToken.moderator)

    const findOneStep1 = await graphqlRequest(oneMutation.find, {where: {id: {EQ: oneMutationInsertedId}}})
        .then(r => r[oneMutation.name])

    const findManyStep1 = await graphqlRequest(manyMutation.find, {where: {id: {EQ: manyMutationInsertedId}}}, staticToken.moderator)
        .then(r => r[manyMutation.name])

    // update many

    const updateManyName = 'new-many-name'
    const upateManyData2 = Object.assign({}, manyData, {name: updateManyName})
    delete upateManyData2.id
    const updateManyStep2 = await graphqlRequest(manyMutation.update, {
        where: {id: manyMutationInsertedId},
        data: upateManyData2
    }, staticToken.moderator)
        .then(r => r[manyMutation.name + 'UpdateOne'])

    const findOneStep2 = await graphqlRequest(oneMutation.find, {where: {id: {EQ: oneMutationInsertedId}}})
        .then(r => r[oneMutation.name])


    const deleteManyMutation = await graphqlRequest(manyMutation.delete, {where: {id: manyMutationInsertedId}}, staticToken.moderator)
        .then(r => r[manyMutation.name + 'DeleteOne'])


    const findOneStep3 = await graphqlRequest(oneMutation.find, {where: {id: {EQ: oneMutationInsertedId}}}, staticToken.moderator)
        .then(r => r[oneMutation.name])

    const deleteOneMutation = await graphqlRequest(oneMutation.delete, {where: {id: oneMutationInsertedId}}, staticToken.moderator)
        .then(r => r[oneMutation.name + 'DeleteOne'])


    t.is(deleteOneMutation.deletedCount, 1)
    t.is(deleteManyMutation.deletedCount, 1)
    t.is(findOneStep1.length, 1)
    t.is(findOneStep1[0].previewImage.url, manyData.url)
    t.is(findOneStep1[0].previewImage.name, manyData.name)
    t.is(findManyStep1.length, 1)
    t.is(findManyStep1[0]._meta.articlesPreviewImages.find(i => i === oneMutationInsertedId), oneMutationInsertedId)
    t.is(findOneStep2[0].previewImage.name, updateManyName) // check if relation updated field is correct
    t.is(!!findOneStep3[0].previewImage, false)
})