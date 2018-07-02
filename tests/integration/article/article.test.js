import test from 'ava'
import {staticToken, graphqlRequest} from '../../../_util/graphqlRequest'


const currentUserId = '5b387f6652a5b71ec2ffe921'
const createArticleGql = `
mutation ($data: ArticleInput) {
  createArticle(data: $data) {
    insertedId
    acknowledged
  }
}`
const createArticleData = {
    'title': 'Test Title',
    'slug': 'test/123',
    'languageKey': 'de',
    'description': 'This is a very long description',
    'metaTitle': 'Meta Title',
    'deleted': false
}

const deleteGql = `
mutation($where:DeleteArticleInput){
  deleteArticle(where:$where){acknowledged deletedCount}
}`

const articleGql = `
query article($where:ArticleWhereInput){
  article(where:$where){
    id
    projectId
    slug
    title
    createdBy
  }
}`


const updateGql = `
mutation ($data: ArticleInput, $where:ArticleWhereInput) {
  updateArticle(data: $data, where:$where) {
    acknowledged
    matchedCount
    modifiedCount
    upsertedId
  }
}
`

// test('create article as not logged in user', async t => {
//     const error = await t.throws(graphqlRequest(articleGql, {data: createArticleData}), Error)
//     console.log(error)
//     // todo throws is not working..
// })

test.serial('create article as moderator', async t => {
    createArticleData.slug += new Date().toISOString().toLowerCase()
    const {createArticle} = await graphqlRequest(createArticleGql, {data: createArticleData}, staticToken.moderator)
    const {article} = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    const {deleteArticle} = await graphqlRequest(deleteGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    t.is(!!createArticle, true)
    t.is(typeof createArticle.insertedId === 'string', true)
    t.is(deleteArticle.deletedCount, 1)
    // compare article
    t.is(article.slug, createArticleData.slug)
    t.is(article.projectId, 'test')
    t.is(article.title, createArticleData.title)
    t.is(article.id, createArticle.insertedId)
    t.is(article.createdBy, currentUserId)
})

test.serial('update article as moderator', async t => {
    createArticleData.slug += new Date().toISOString().toLowerCase()
    const {createArticle} = await graphqlRequest(createArticleGql, {data: createArticleData}, staticToken.moderator)
    const updateArticleData = Object.assign({}, createArticleData, {
        title: createArticleData.title + '-updated'
    })
    const {updateArticle} = await graphqlRequest(updateGql, {
        data: updateArticleData,
        where: {id: createArticle.insertedId}
    })
    const {article} = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    const {deleteArticle} = await graphqlRequest(deleteGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    t.is(!!createArticle, true)
    t.is(typeof createArticle.insertedId === 'string', true)
    t.is(deleteArticle.deletedCount, 1)
    // compare article
    t.is(article.slug, updateArticleData.slug)
    t.is(article.projectId, 'test')
    t.is(article.title, updateArticleData.title)
    t.is(article.id, createArticle.insertedId)
    t.is(article.createdBy, currentUserId)

})