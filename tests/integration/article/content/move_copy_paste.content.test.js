import test from 'ava'
import {staticToken, graphqlRequest} from '../../../../_util/graphqlRequest'
import {articleGql, createArticleGql, deleteArticleGql} from '../../../../_util/articlesGqlStatements'
import {moveContentGql} from '../../../../_util/contentGqlStatements'
import fixtureArticle from '../../../../_util/fixture.article'

test.serial('move one content as cut and paste', async t => {
    fixtureArticle.slug += new Date().toISOString().toLowerCase()
    const {createArticle} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)
    const {article} = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    // move one content element
    const moveFrom = article.contentElements[1].children[0].children[1]
    const moveTo = article.contentElements[2]

    const variables = {
        where: {
            from: {
                id: moveFrom.id,
                materializedPath: moveFrom.materializedPath,
                articleId: article.id
            },
            to: {
                id: moveTo.id,
                materializedPath: moveTo.materializedPath,
                articleId: article.id
            }
        },
        data: moveFrom
    }
    const {moveContent} = await graphqlRequest(moveContentGql, variables, staticToken.moderator)
    // query article again
    const updatedArticle = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
        .then(r => r.article)

    const {deleteArticle} = await graphqlRequest(deleteArticleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    t.is(moveContent.matchedCount, 1)
    t.is(moveContent.modifiedCount, 1)
    t.is(!!createArticle, true)
    t.is(typeof createArticle.insertedId === 'string', true)
    t.is(deleteArticle.deletedCount, 1)
    // compare article content
    t.is(article.contentElements.length, 3)
    t.is(updatedArticle.contentElements.length, 4)
    t.is(updatedArticle.contentElements[3].id, moveFrom.id)
    t.is(updatedArticle.contentElements[3].materializedPath, '3,')
    t.is(updatedArticle.contentElements[1].children[0].children.length, 2)
})

test.serial('move one content as copy and paste', async t => {
    fixtureArticle.slug += new Date().toISOString().toLowerCase()
    const {createArticle} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)
    const {article} = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    // move one content element
    const moveFrom = article.contentElements[1].children[0].children[1]
    const moveTo = article.contentElements[1].children[1].children[0]

    const variables = {
        where: {
            from: {
                id: moveFrom.id,
                materializedPath: moveFrom.materializedPath,
                articleId: article.id
            },
            to: {
                id: moveTo.id,
                materializedPath: moveTo.materializedPath,
                articleId: article.id
            }
        },
        data: moveFrom,
        isCopy: true
    }
    const {moveContent} = await graphqlRequest(moveContentGql, variables, staticToken.moderator)
    // query article again
    const updatedArticle = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
        .then(r => r.article)

    const {deleteArticle} = await graphqlRequest(deleteArticleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    t.is(moveContent.matchedCount, 1)
    t.is(moveContent.modifiedCount, 1)
    t.is(!!createArticle, true)
    t.is(typeof createArticle.insertedId === 'string', true)
    t.is(deleteArticle.deletedCount, 1)
    // compare article content
    t.is(article.contentElements.length, 3)
    t.is(updatedArticle.contentElements.length, 3)
    t.is(updatedArticle.contentElements[1].children[0].children.length, 3)
    t.is(updatedArticle.contentElements[1].children[1].children[1].description, moveFrom.description)
    t.is(updatedArticle.contentElements[1].children[1].children[1].materializedPath, '1,1,1,')
    t.is(updatedArticle.contentElements[1].children[1].children.length, 2)
})