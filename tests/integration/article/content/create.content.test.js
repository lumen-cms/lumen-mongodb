import test from 'ava'
import {staticToken, graphqlRequest} from '../../../../_util/graphqlRequest'
import {articleGql, createArticleGql, deleteArticleGql} from '../../../../_util/articlesGqlStatements'
import {moveContentGql} from '../../../../_util/contentGqlStatements'

import fixtureArticle from '../../../../_util/fixture.article'


test.serial('create article with content and make sure id and path on content exists', async t => {
    fixtureArticle.slug += new Date().toISOString().toLowerCase()
    const {createArticle} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)
    const {article} = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    const {deleteArticle} = await graphqlRequest(deleteArticleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    t.is(!!createArticle, true)
    t.is(typeof createArticle.insertedId === 'string', true)
    t.is(deleteArticle.deletedCount, 1)
    // compare article
    t.is(article.slug, fixtureArticle.slug)
    t.is(article.projectId, 'test')
    t.is(article.title, fixtureArticle.title)
    t.is(article.id, createArticle.insertedId)
    t.is(article.contentElements.length, 3)
    article.contentElements.forEach((content, firstLevelIteration) => {
        t.is(typeof content.id, 'string')
        t.is(typeof content.materializedPath, 'string')
        t.is(content.materializedPath, `${firstLevelIteration},`)
        t.is(fixtureArticle.contentElements[firstLevelIteration].description, content.description)
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