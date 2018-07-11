import test from 'ava'
import {staticToken, graphqlRequest} from '../../util/graphqlRequest'
import {
    createArticleGql,
    deleteArticleGql,
    deleteManyArticlesGql,
    updateArticleGql,
    articleGql,
    findArticlesGql
} from '../../util/articleGqlStatements'

import {createTagGql, findTagsGql, updateTagGql, deleteTagGql} from '../../util/tagGqlStatements'

const createArticleData = {
    title: 'Test Title',
    slug: 'test/123',
    languageKey: 'de',
    description: 'This is a very long description',
    metaTitle: 'Meta Title',
    deleted: false,
    published: true
}

const createTagData = {
    languageKey: 'de',
    title: 'my-title',
    type: 'article',
    slug: 'my-tag-test'
}

test.serial('update tags on article check on related fields', async t => {
    createTagData.slug += new Date().toISOString().toLowerCase()
    const {createTag} = await graphqlRequest(createTagGql, {data: createTagData}, staticToken.moderator)
    createArticleData.slug += new Date().toISOString().toLowerCase()
    const {createArticle} = await graphqlRequest(createArticleGql, {data: createArticleData}, staticToken.moderator)
    const insertedArticleId = createArticle.insertedId
    const insertedTagId = createTag.insertedId
    const {updateArticle} = await graphqlRequest(updateArticleGql, {
        data: {
            tags: [{
                id: insertedTagId,
                slug: createTagData.slug,
                title: createTagData.title
            }]
        },
        where: {id: insertedArticleId}
    }, staticToken.moderator)
    const {article} = await graphqlRequest(articleGql, {where: {id: insertedArticleId}}, staticToken.moderator)
    const {findTags} = await graphqlRequest(findTagsGql, {where: {id: insertedTagId}}, staticToken.moderator)
    const {deleteArticle} = await graphqlRequest(deleteArticleGql, {where: {id: insertedArticleId}}, staticToken.moderator)
    const {deleteTag} = await graphqlRequest(deleteTagGql, {where: {id: insertedTagId}}, staticToken.moderator)
    const tag = findTags[0]
    t.is(tag.id, insertedTagId)
    t.is(deleteTag.deletedCount, 1)
    t.is(typeof insertedTagId, 'string')
    t.is(!!createArticle, true)
    t.is(typeof insertedArticleId, 'string')
    t.is(deleteArticle.deletedCount, 1)
    t.is(article.tags.length, 1)

})