import test from 'ava'
import {staticToken, graphqlRequest} from '../../../util/graphqlRequest'
import {articleGql, createArticleGql, deleteArticleGql, updateArticleGql} from '../../../util/articleGqlStatements'
import {createContentGql} from '../../../util/contentGqlStatements'

import fixtureArticle from '../../../util/fixture.article'


test.serial('create article with content and make sure id and path on content exists', async t => {
    fixtureArticle.slug += new Date().toISOString().toLowerCase()
    const {articlesCreateOne} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)

    const newData = {
        type: 'TextImage',
        description: 'This is new'
    }

    // create content
    const articleId = articlesCreateOne.insertedId
    const {createContent} = await graphqlRequest(createContentGql, {
        data: newData,
        where: {
            articleId: articleId,
            materializedPath: '',
            position: 0
        }
    }, staticToken.moderator)

    const {article} = await graphqlRequest(articleGql, {where: {id: articleId}}, staticToken.moderator)
    const {articlesUpdateOne} = await graphqlRequest(updateArticleGql, {
        where: {id: articleId},
        data: {
            published: true,
            title: 'My other title',
            slug: 'some-random-slug',
            languageKey: 'de'
        }
    }, staticToken.moderator)
    const afterChangeOfArticlePublish = await graphqlRequest(articleGql, {where: {id: articleId}}, staticToken.moderator)
        .then(r => r.article)

    const {articlesDeleteOne} = await graphqlRequest(deleteArticleGql, {where: {id: articleId}}, staticToken.moderator)

    t.is(!!articlesCreateOne, true)
    t.is(typeof articleId === 'string', true)
    t.is(articlesDeleteOne.deletedCount, 1)
    t.is(createContent.updated, true)
    // compare article
    t.is(article.contentElements.length, 4)
    t.is(article.contentElements[0].description, newData.description)
    t.is(fixtureArticle.contentElements[0].description, article.contentElements[1].description)
    t.is(afterChangeOfArticlePublish.contentElements.length, 4)
})