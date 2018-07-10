import test from 'ava'
import {staticToken, graphqlRequest} from '../../../../_util/graphqlRequest'
import {articleGql, createArticleGql, deleteArticleGql} from '../../../../_util/articleGqlStatements'
import {createContentGql} from '../../../../_util/contentGqlStatements'

import fixtureArticle from '../../../../_util/fixture.article'


test.serial('create article with content and make sure id and path on content exists', async t => {
    fixtureArticle.slug += new Date().toISOString().toLowerCase()
    const {createArticle} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)

    const newData = {
        type: 'TextImage',
        description: 'This is new'
    }

    // create content
    const {createContent} = await graphqlRequest(createContentGql, {
        data: newData,
        where: {
            articleId: createArticle.insertedId,
            materializedPath: '',
            position: 0
        }
    }, staticToken.moderator)

    const {article} = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    const {deleteArticle} = await graphqlRequest(deleteArticleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)

    t.is(!!createArticle, true)
    t.is(typeof createArticle.insertedId === 'string', true)
    t.is(deleteArticle.deletedCount, 1)
    t.is(createContent.updated, true)
    // compare article
    t.is(article.contentElements.length, 4)
    t.is(article.contentElements[0].description, newData.description)
    t.is(fixtureArticle.contentElements[0].description, article.contentElements[1].description)
})