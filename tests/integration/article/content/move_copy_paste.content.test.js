import test from 'ava'
import {staticToken, graphqlRequest} from '../../../util/graphqlRequest'
import {articleGql, createArticleGql, deleteArticleGql} from '../../../util/articleGqlStatements'
import {moveContentGql} from '../../../util/contentGqlStatements'
import fixtureArticle from '../../../util/fixture.article'

test.serial('move one content as cut and paste', async t => {
    fixtureArticle.slug += new Date().toISOString().toLowerCase() + 4688
    const {articlesCreateOne} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)
    const insertedId = articlesCreateOne.insertedId
    const {article} = await graphqlRequest(articleGql, {where: {id: insertedId}}, staticToken.moderator)
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
        position: 2
    }
    const {moveContent} = await graphqlRequest(moveContentGql, variables, staticToken.moderator)
    // query article again
    const updatedArticle = await graphqlRequest(articleGql, {where: {id: insertedId}}, staticToken.moderator)
        .then(r => r.article)

    const {articlesDeleteOne} = await graphqlRequest(deleteArticleGql, {where: {id: insertedId}}, staticToken.moderator)
    t.is(moveContent.matchedCount, 1)
    t.is(moveContent.modifiedCount, 1)
    t.is(!!articlesCreateOne, true)
    t.is(typeof insertedId === 'string', true)
    t.is(articlesDeleteOne.deletedCount, 1)
    // compare article content
    t.is(article.contentElements.length, 3)
    t.is(updatedArticle.contentElements.length, 4)
    t.is(updatedArticle.contentElements[3].title, moveFrom.title)
    t.is(updatedArticle.contentElements[3].materializedPath, '')
    t.is(updatedArticle.contentElements[1].children[0].children.length, 2)
})

test.serial('move one content as copy and paste', async t => {
    fixtureArticle.slug += new Date().toISOString().toLowerCase() + 79797
    const {articlesCreateOne} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)
    const insertedId = articlesCreateOne.insertedId
    const {article} = await graphqlRequest(articleGql, {where: {id: insertedId}}, staticToken.moderator)
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
        isCopy: true,
        position: 1
    }
    const {moveContent} = await graphqlRequest(moveContentGql, variables, staticToken.moderator)
    // query article again
    const updatedArticle = await graphqlRequest(articleGql, {where: {id: insertedId}}, staticToken.moderator)
        .then(r => r.article)

    const {articlesDeleteOne} = await graphqlRequest(deleteArticleGql, {where: {id: insertedId}}, staticToken.moderator)
    t.is(moveContent.matchedCount, 1)
    t.is(moveContent.modifiedCount, 1)
    t.is(!!articlesCreateOne, true)
    t.is(typeof insertedId === 'string', true)
    t.is(articlesDeleteOne.deletedCount, 1)
    // compare article content
    t.is(article.contentElements.length, 3)
    t.is(updatedArticle.contentElements.length, 3)
    t.is(updatedArticle.contentElements[1].children[0].children.length, 3)
    t.is(updatedArticle.contentElements[1].children[1].children[1].description, moveFrom.description)
    t.is(updatedArticle.contentElements[1].children[1].children[1].materializedPath, '1,1,')
    t.is(updatedArticle.contentElements[1].children[1].children.length, 2)
})