import test from 'ava'
import {staticToken, graphqlRequest} from '../../../util/graphqlRequest'
import {articleGql, createArticleGql, deleteArticleGql} from '../../../util/articleGqlStatements'
import {deleteContentGql} from '../../../util/contentGqlStatements'
import fixtureArticle from '../../../util/fixture.article'


test.serial('delete one content element which does not exist', async t => {
    fixtureArticle.slug += new Date().toISOString().toLowerCase()
    const {createArticle} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)
    const {article} = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    // delete one content element
    const deleteIdOfContent = article.contentElements[1].id
    const materializedPath = article.contentElements[1].materializedPath
    const variables = {
        where: {
            articleId: article.id,
            id: deleteIdOfContent + 123, // fake it to fail test
            materializedPath: materializedPath// make it wrong to fail test
        }
    }
    const {deleteContent} = await graphqlRequest(deleteContentGql, variables, staticToken.moderator)
    // query article again
    const updatedArticle = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
        .then(r => r.article)
    const {deleteArticle} = await graphqlRequest(deleteArticleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    t.is(deleteContent.updated, false)
    t.is(!!createArticle, true)
    t.is(typeof createArticle.insertedId === 'string', true)
    t.is(deleteArticle.deletedCount, 1)
    // compare article
    t.is(article.contentElements.length, 3)
    t.is(updatedArticle.contentElements.length, 3)
})

test.serial('delete one content element of an article', async t => {
    fixtureArticle.slug += new Date().toISOString().toLowerCase()
    const {createArticle} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)
    const {article} = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    // delete one content element
    const deleteIdOfContent = article.contentElements[1].id
    const materializedPath = article.contentElements[1].materializedPath
    const variables = {
        where: {
            articleId: article.id,
            id: deleteIdOfContent,
            materializedPath
        }
    }
    const {deleteContent} = await graphqlRequest(deleteContentGql, variables, staticToken.moderator)
    // query article again
    const updatedArticle = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
        .then(r => r.article)

    const {deleteArticle} = await graphqlRequest(deleteArticleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    t.is(deleteContent.updated, true)
    t.is(!!createArticle, true)
    t.is(typeof createArticle.insertedId === 'string', true)
    t.is(deleteArticle.deletedCount, 1)
    // compare article
    t.is(article.contentElements.length, 3)
    t.is(updatedArticle.contentElements.length, 2)
})

test.serial('delete one content element of a nested child element of an article', async t => {
    fixtureArticle.slug += new Date().toISOString().toLowerCase()
    const {createArticle} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)
    const {article} = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    // delete one content element
    const child = article.contentElements[1].children[0].children[1]
    const deleteIdOfContent = child.id
    const path = child.materializedPath
    const variables = {
        where: {
            articleId: article.id,
            id: deleteIdOfContent,
            materializedPath: path
        }
    }
    const {deleteContent} = await graphqlRequest(deleteContentGql, variables, staticToken.moderator)
    // query article again
    const updatedArticle = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
        .then(r => r.article)

    const {deleteArticle} = await graphqlRequest(deleteArticleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    t.is(deleteContent.updated, true)
    t.is(!!createArticle, true)
    t.is(typeof createArticle.insertedId === 'string', true)
    t.is(deleteArticle.deletedCount, 1)
    // compare article content
    t.is(article.contentElements.length, 3)
    t.is(updatedArticle.contentElements.length, 3)
    t.is(updatedArticle.contentElements[1].children[0].children.length, 2)
})