import test from 'ava'
import {staticToken, graphqlRequest} from '../../../util/graphqlRequest'
import {articleGql, createArticleGql, deleteArticleGql} from '../../../util/articleGqlStatements'
import {createFileReferencesGql, updateContentGql} from '../../../util/contentGqlStatements'

import fixtureArticle from '../../../util/fixture.article'


const testFile = {
    url: 'https://some-test-file.png',
    key: 'adfasfas',
    id: new Date().toISOString(),
    name: 'test-img',
    size: 123123,
    width: 200,
    height: 200,
    contentType: 'img/png'
}

const testFileReference = {
    file: testFile,
    caption:null,
    title:null
}

test.serial('create file reference on article content element', async t => {
    fixtureArticle.slug += new Date().toISOString().toLowerCase()
    const {articlesCreateOne} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)
    const insertedId = articlesCreateOne.insertedId
    const {article} = await graphqlRequest(articleGql, {where: {id: insertedId}}, staticToken.moderator)

    const contentToModify = article.contentElements[1].children[0].children[1]
    testFileReference.file.id = new Date().toISOString()
    const newFileReference = [Object.assign({}, testFileReference)]

    // create content
    const {createFileReferences} = await graphqlRequest(createFileReferencesGql, {
        data: newFileReference,
        where: {
            articleId: insertedId,
            materializedPath: contentToModify.materializedPath,
            id: contentToModify.id
        }
    }, staticToken.moderator)
    const updatedArticle = await graphqlRequest(articleGql, {where: {id: insertedId}}, staticToken.moderator)
        .then(r => r.article)

    const {articlesDeleteOne} = await graphqlRequest(deleteArticleGql, {where: {id: insertedId}}, staticToken.moderator)

    const contentBeforeFileReference = article.contentElements[1].children[0].children[1]
    const contentAfterFileReference = updatedArticle.contentElements[1].children[0].children[1]
    t.is(articlesDeleteOne.deletedCount, 1)
    t.deepEqual(contentBeforeFileReference, contentToModify)
    contentAfterFileReference.fileReferences.map(i => {
        delete i.id
        return i
    })
    t.deepEqual(contentAfterFileReference.fileReferences, newFileReference)
})

test.serial('create background file reference on article content element', async t => {
    fixtureArticle.slug += new Date().toISOString().toLowerCase()
    const {articlesCreateOne} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)
    const insertedId = articlesCreateOne.insertedId
    const {article} = await graphqlRequest(articleGql, {where: {id: insertedId}}, staticToken.moderator)

    const contentToModify = article.contentElements[1].children[0].children[1]
    testFileReference.file.id = new Date().toISOString()

    const newFileReference = [Object.assign({}, testFileReference)]

    // create content
    const {createFileReferences} = await graphqlRequest(createFileReferencesGql, {
        data: newFileReference,
        where: {
            articleId: insertedId,
            materializedPath: contentToModify.materializedPath,
            id: contentToModify.id
        },
        isBackground: true
    }, staticToken.moderator)
    const updatedArticle = await graphqlRequest(articleGql, {where: {id: insertedId}}, staticToken.moderator)
        .then(r => r.article)

    const {articlesDeleteOne} = await graphqlRequest(deleteArticleGql, {where: {id: insertedId}}, staticToken.moderator)

    const contentBeforeFileReference = article.contentElements[1].children[0].children[1]
    const contentAfterFileReference = updatedArticle.contentElements[1].children[0].children[1]
    t.is(articlesDeleteOne.deletedCount, 1)
    t.deepEqual(contentBeforeFileReference, contentToModify)
    contentAfterFileReference.backgroundFileReferences.map(i => {
        delete i.id
        return i
    })
    t.deepEqual(contentAfterFileReference.backgroundFileReferences, newFileReference)
})


test.serial('update file reference on article content element', async t => {
    testFileReference.file.id = new Date().toISOString()
    const newFileReference = [Object.assign({}, testFileReference)]
    fixtureArticle.slug += new Date().toISOString().toLowerCase()
    fixtureArticle.contentElements[1].children[0].children[1].fileReferences = newFileReference
    const {articlesCreateOne} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)
    const insertedId = articlesCreateOne.insertedId
    const {article} = await graphqlRequest(articleGql, {where: {id: insertedId}}, staticToken.moderator)
    const contentToModify = article.contentElements[1].children[0].children[1]
    const newDescription = 'This is a new description'
    const newData = Object.assign({}, contentToModify, {
        description: newDescription
    })
    newData.fileReferences[0].title = 'some new title'
    // update content
    const {updateContent} = await graphqlRequest(updateContentGql, {
        data: newData,
        where: {
            articleId: insertedId,
            materializedPath: contentToModify.materializedPath,
            id: contentToModify.id
        }
    }, staticToken.moderator)

    const updatedArticle = await graphqlRequest(articleGql, {where: {id: insertedId}}, staticToken.moderator)
        .then(r => r.article)

    const {articlesDeleteOne} = await graphqlRequest(deleteArticleGql, {where: {id: insertedId}}, staticToken.moderator)

    const contentBeforeUpdate = article.contentElements[1].children[0].children[1]
    const contentAfterUpdate= updatedArticle.contentElements[1].children[0].children[1]
    t.is(articlesDeleteOne.deletedCount, 1)
    t.is(contentBeforeUpdate.id, contentAfterUpdate.id)
    t.is(contentBeforeUpdate.type, contentAfterUpdate.type)
    t.deepEqual(contentAfterUpdate, newData)
})