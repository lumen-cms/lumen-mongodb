import test from 'ava'
import {staticToken, graphqlRequest} from '../../util/graphqlRequest'
import {createArticleGql, deleteArticleGql, deleteManyArticlesGql, updateArticleGql,articleGql,findArticlesGql} from '../../util/articleGqlStatements'

const currentUserId = '5b387f6652a5b71ec2ffe921'

const createArticleData = {
    title: 'Test Title',
    slug: 'test/123',
    languageKey: 'de',
    description: 'This is a very long description',
    metaTitle: 'Meta Title',
    deleted: false,
    published: true
}


// test('create article as not logged in user', async t => {
//     const error = await t.throws(graphqlRequest(articleGql, {data: createArticleData}), Error)
//     console.log(error)
//     // todo throws is not working..
// })

test.serial('create article as moderator', async t => {
    createArticleData.slug += new Date().toISOString().toLowerCase()
    const {articlesCreateOne} = await graphqlRequest(createArticleGql, {data: createArticleData}, staticToken.moderator)
    const insertedId = articlesCreateOne.insertedId
    const {article} = await graphqlRequest(articleGql, {where: {id: insertedId}}, staticToken.moderator)
    const {articlesDeleteOne} = await graphqlRequest(deleteArticleGql, {where: {id: insertedId}}, staticToken.moderator)
    t.is(!!articlesCreateOne, true)
    t.is(typeof insertedId === 'string', true)
    t.is(articlesDeleteOne.deletedCount, 1)
    // compare article
    t.is(article.slug, createArticleData.slug)
    t.is(article.projectId, 'test')
    t.is(article.title, createArticleData.title)
    t.is(article.id, insertedId)
    t.is(article.createdBy, currentUserId)
})

test.serial('update article as moderator', async t => {
    createArticleData.slug += new Date().toISOString().toLowerCase()
    const {articlesCreateOne} = await graphqlRequest(createArticleGql, {data: createArticleData}, staticToken.moderator)
    const updateArticleData = Object.assign({}, createArticleData, {
        title: createArticleData.title + '-updated'
    })
    const insertedId = articlesCreateOne.insertedId
    const {articlesUpdateOne} = await graphqlRequest(updateArticleGql, {
        data: updateArticleData,
        where: {id: insertedId}
    }, staticToken.moderator)
    const {article} = await graphqlRequest(articleGql, {where: {id: insertedId}}, staticToken.moderator)
    const {articlesDeleteOne} = await graphqlRequest(deleteArticleGql, {where: {id: insertedId}}, staticToken.moderator)
    t.is(!!articlesCreateOne, true)
    t.is(typeof insertedId === 'string', true)
    t.is(articlesDeleteOne.deletedCount, 1)
    // compare article
    t.is(articlesUpdateOne.modifiedCount, 1)
    t.is(article.slug, updateArticleData.slug)
    t.is(article.projectId, 'test')
    t.is(article.title, updateArticleData.title)
    t.is(article.id, insertedId)
    t.is(article.createdBy, currentUserId)
})


test.serial('find articles as moderator and not-authorized user', async t => {
    createArticleData.slug += new Date().toISOString().toLowerCase()
    const createdArticlesIds = []
    for (let i = 1; i <= 5; i++) {
        const currentData = Object.assign({}, createArticleData, {
            slug: createArticleData.slug + '-' + i
        })
        if (i === 2 || i === 3) {
            currentData.published = false
        } else {
            currentData.published = true
        }
        const {articlesCreateOne} = await graphqlRequest(createArticleGql, {data: currentData}, staticToken.moderator)
        createdArticlesIds.push(articlesCreateOne.insertedId)
    }

    const findAnonymous = await graphqlRequest(findArticlesGql, null)
        .then(r => r.findArticles)

    const {deleteArticlesOnIds} = await graphqlRequest(deleteManyArticlesGql, {where: {ids: createdArticlesIds}}, staticToken.moderator)
    t.is(deleteArticlesOnIds.deletedCount, 5)
    // compare article
    t.is(createdArticlesIds.length, 5)
    t.is(findAnonymous.length, 3)
})