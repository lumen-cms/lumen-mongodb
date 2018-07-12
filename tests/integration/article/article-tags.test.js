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

test.serial('add tag to article and remove the tag again with update article method', async t => {
    createTagData.slug += new Date().toISOString().toLowerCase()
    const {tagsCreateOne} = await graphqlRequest(createTagGql, {data: createTagData}, staticToken.moderator)
    createArticleData.slug += new Date().toISOString().toLowerCase()
    const {articlesCreateOne} = await graphqlRequest(createArticleGql, {data: createArticleData}, staticToken.moderator)
    const insertedArticleId = articlesCreateOne.insertedId
    const insertedTagId = tagsCreateOne.insertedId

    // add some tag
    const {articlesUpdateOne} = await graphqlRequest(updateArticleGql, {
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
    const {tags} = await graphqlRequest(findTagsGql, {where: {id: {EQ: insertedTagId}}}, staticToken.moderator)

    // reset tags array
    const updateArticleWithNoRef = await graphqlRequest(updateArticleGql, {
        data: {
            tags: []
        },
        where: {id: insertedArticleId}
    }, staticToken.moderator)
        .then(r => r.articlesUpdateOne)
    const articleAfterReset = await graphqlRequest(articleGql, {where: {id: insertedArticleId}}, staticToken.moderator)
        .then(r => r.article)
    const tagsAfterReset = await graphqlRequest(findTagsGql, {where: {id: {EQ:insertedTagId}}}, staticToken.moderator)
        .then(r => r.tags)
    const {articlesDeleteOne} = await graphqlRequest(deleteArticleGql, {where: {id: insertedArticleId}}, staticToken.moderator)
    const {tagsDeleteOne} = await graphqlRequest(deleteTagGql, {where: {id: insertedTagId}}, staticToken.moderator)
    const tag = tags[0]
    t.is(tag.id, insertedTagId)
    t.is(tagsDeleteOne.deletedCount, 1)
    t.is(typeof insertedTagId, 'string')
    t.is(!!articlesCreateOne, true)
    t.is(typeof insertedArticleId, 'string')
    t.is(articlesDeleteOne.deletedCount, 1)
    t.is(article.tags.length, 1)
    t.is(article.tags[0].id, tag.id)
    t.is(article.tags[0].title, tag.title)
    t.is(article.tags[0].slug, tag.slug)
    t.is(!!tag._meta.articles.find(e => e === insertedArticleId), true)
    t.is(articleAfterReset.tags.length, 0)
    t.is(tagsAfterReset[0]._meta.articles.length, 0)
})

test.serial('add tag to article and rename tag', async t => {
    createTagData.slug += new Date().toISOString().toLowerCase()
    const {tagsCreateOne} = await graphqlRequest(createTagGql, {data: createTagData}, staticToken.moderator)
    createArticleData.slug += new Date().toISOString().toLowerCase()
    const {articlesCreateOne} = await graphqlRequest(createArticleGql, {data: createArticleData}, staticToken.moderator)
    const insertedArticleId = articlesCreateOne.insertedId
    const insertedTagId = tagsCreateOne.insertedId

    // add some tag
    const {articlesUpdateOne} = await graphqlRequest(updateArticleGql, {
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
    const {tags} = await graphqlRequest(findTagsGql, {where: {id: {EQ:insertedTagId}}}, staticToken.moderator)

    // rename tag title
    const newTagTitle = 'some awesome new title'
    const updateTagTitle = await graphqlRequest(updateTagGql, {
        data: {
            slug: createTagData.slug,
            title: newTagTitle
        },
        where: {id: insertedTagId}
    }, staticToken.moderator)
        .then(r => r.tagsUpdateOne)
    const articleAfterReset = await graphqlRequest(articleGql, {where: {id: insertedArticleId}}, staticToken.moderator)
        .then(r => r.article)
    const tagsAfterReset = await graphqlRequest(findTagsGql, {where: {id: {EQ:insertedTagId}}}, staticToken.moderator)
        .then(r => r.tags)
    const {articlesDeleteOne} = await graphqlRequest(deleteArticleGql, {where: {id: insertedArticleId}}, staticToken.moderator)
    const {tagsDeleteOne} = await graphqlRequest(deleteTagGql, {where: {id: insertedTagId}}, staticToken.moderator)
    const tag = tags[0]
    t.is(tag.id, insertedTagId)
    t.is(tagsDeleteOne.deletedCount, 1)
    t.is(typeof insertedTagId, 'string')
    t.is(!!articlesCreateOne, true)
    t.is(typeof insertedArticleId, 'string')
    t.is(articlesDeleteOne.deletedCount, 1)
    t.is(updateTagTitle.modifiedCount, 1)
    t.is(article.tags.length, 1)
    t.is(article.tags[0].id, tag.id)
    t.is(article.tags[0].title, tag.title)
    t.is(article.tags[0].slug, tag.slug)
    t.is(!!tag._meta.articles.find(e => e === insertedArticleId), true)
    t.is(articleAfterReset.tags[0].title, newTagTitle)
    t.is(tagsAfterReset[0]._meta.articles.length, 1)
})

test.serial('add tag to article and delete tag afterwards', async t => {
    createTagData.slug += new Date().toISOString().toLowerCase()
    const {tagsCreateOne} = await graphqlRequest(createTagGql, {data: createTagData}, staticToken.moderator)
    createArticleData.slug += new Date().toISOString().toLowerCase()
    const {articlesCreateOne} = await graphqlRequest(createArticleGql, {data: createArticleData}, staticToken.moderator)
    const insertedArticleId = articlesCreateOne.insertedId
    const insertedTagId = tagsCreateOne.insertedId

    // add some tag
    const {articlesUpdateOne} = await graphqlRequest(updateArticleGql, {
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
    const {tags} = await graphqlRequest(findTagsGql, {where: {id: {EQ:insertedTagId}}}, staticToken.moderator)

    // delete tag again
    const {tagsDeleteOne} = await graphqlRequest(deleteTagGql, {
        where: {id: insertedTagId}
    }, staticToken.moderator)
    const articleAfterReset = await graphqlRequest(articleGql, {where: {id: insertedArticleId}}, staticToken.moderator)
        .then(r => r.article)
    const tagsAfterReset = await graphqlRequest(findTagsGql, {where: {id: {EQ:insertedTagId}}}, staticToken.moderator)
        .then(r => r.tags)
    const {articlesDeleteOne} = await graphqlRequest(deleteArticleGql, {where: {id: insertedArticleId}}, staticToken.moderator)

    t.is(tagsDeleteOne.deletedCount, 1)
    t.is(articleAfterReset.tags.length, 0)
    t.is(tagsAfterReset.length, 0)
})

test.serial('add tag to article and delete article afterwards', async t => {
    createTagData.slug += new Date().toISOString().toLowerCase()
    const {tagsCreateOne} = await graphqlRequest(createTagGql, {data: createTagData}, staticToken.moderator)

    const slug2 = createTagData.slug + new Date().toISOString().toLowerCase() + 2
    const createTag2 = await graphqlRequest(createTagGql, {data: Object.assign({}, createTagData, {slug: slug2})}, staticToken.moderator)
        .then(r => r.tagsCreateOne)

    const insertedTagId = tagsCreateOne.insertedId
    const insertedTagId2 = createTag2.insertedId

    createArticleData.slug += new Date().toISOString().toLowerCase()
    const {articlesCreateOne} = await graphqlRequest(createArticleGql, {data: createArticleData}, staticToken.moderator)

    const articleSlug2 = createArticleData.slug + new Date().toISOString().toLowerCase() + 2

    const createArticle2 = await graphqlRequest(createArticleGql, {
        data: Object.assign({}, createArticleData, {
            slug: articleSlug2,
            tags: [{
                id: insertedTagId2,
                slug: createTagData.slug + 2,
                title: createTagData.title + 2
            }]
        })
    }, staticToken.moderator)
        .then(r => r.articlesCreateOne)


    const insertedArticleId = articlesCreateOne.insertedId
    const insertedArticleId2 = createArticle2.insertedId

    // add some tag
    const {articlesUpdateOne} = await graphqlRequest(updateArticleGql, {
        data: {
            tags: [{
                id: insertedTagId,
                slug: createTagData.slug,
                title: createTagData.title
            }, {
                id: insertedTagId2,
                slug: createTagData.slug + 2,
                title: createTagData.title + 2
            }]
        },
        where: {id: insertedArticleId}
    }, staticToken.moderator)

    const {article} = await graphqlRequest(articleGql, {where: {id: insertedArticleId}}, staticToken.moderator)
    const {tags} = await graphqlRequest(findTagsGql, {where: {id: {IN: [insertedTagId, insertedTagId2]}}}, staticToken.moderator)

    // delete tag again
    const {articlesDeleteOne} = await graphqlRequest(deleteArticleGql, {where: {id: insertedArticleId}}, staticToken.moderator)

    const tagsAfterReset = await graphqlRequest(findTagsGql, {where: {id: {IN: [insertedTagId2, insertedTagId]}}}, staticToken.moderator)
        .then(r => r.tags)

    const {tagsDeleteOne} = await graphqlRequest(deleteTagGql, {
        where: {id: insertedTagId}
    }, staticToken.moderator)
    const deleteArticle2 = await graphqlRequest(deleteArticleGql, {where: {id: insertedArticleId2}}, staticToken.moderator)
        .then(r => r.articlesDeleteOne)

    const deleteTag2 = await graphqlRequest(deleteTagGql, {
        where: {id: insertedTagId2}
    }, staticToken.moderator)
        .then(r => r.tagsDeleteOne)


    // todo need to fix the correct count


    t.is(tags.length, 2)
    t.is(article.tags.length, 2)
    t.is(articlesDeleteOne.deletedCount, 1)
    t.is(deleteArticle2.deletedCount, 1)
    t.is(tagsDeleteOne.deletedCount, 1)
    t.is(deleteTag2.deletedCount, 1)
    t.is(tagsAfterReset.length, 2)
    t.is(tagsAfterReset[0]._meta.articles.length, 0)
})