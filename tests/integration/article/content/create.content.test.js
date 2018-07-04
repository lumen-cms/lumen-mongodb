import test from 'ava'
import {staticToken, graphqlRequest} from '../../../../_util/graphqlRequest'
import {articleGql, createArticleGql, deleteArticleGql} from '../../../../_util/articlesGqlStatements'
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
            materializedPath: '0,',
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
    article.contentElements.forEach((content, firstLevelIteration) => {
        t.is(typeof content.id, 'string')
        t.is(typeof content.materializedPath, 'string')
        t.is(content.materializedPath, `${firstLevelIteration},`)
        if (Array.isArray(content.children)) {
            content.children.forEach((child, secondLevelIteration) => {
                t.is(typeof child.id, 'string')
                t.is(typeof child.materializedPath, 'string')
                t.is(child.materializedPath, `${firstLevelIteration},${secondLevelIteration},`)
                t.is(fixtureArticle.contentElements[firstLevelIteration].children[secondLevelIteration].children[0].description, child.children[0].description)
                if (Array.isArray(child.children)) {
                    child.children.forEach((subChild, thirdLevelIteration) => {
                        t.is(typeof subChild.id, 'string')
                        t.is(typeof subChild.materializedPath, 'string')
                        t.is(subChild.materializedPath, `${firstLevelIteration},${secondLevelIteration},${thirdLevelIteration},`)
                        t.is(fixtureArticle.contentElements[firstLevelIteration].children[secondLevelIteration].children[thirdLevelIteration].description, subChild.description)
                    })
                }
            })
        }
    })
})