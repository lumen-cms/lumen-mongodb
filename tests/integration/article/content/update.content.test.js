import test from 'ava'
import {staticToken, graphqlRequest} from '../../../../_util/graphqlRequest'
import {articleGql, createArticleGql, deleteArticleGql} from '../../../../_util/articleGqlStatements'
import {updateContentGql} from '../../../../_util/contentGqlStatements'
import fixtureArticle from '../../../../_util/fixture.article'

test.serial('update content of an article', async t => {
    fixtureArticle.slug += new Date().toISOString().toLowerCase()
    const {createArticle} = await graphqlRequest(createArticleGql, {data: fixtureArticle}, staticToken.moderator)
    const {article} = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    const contentToModify = article.contentElements[1].children[0].children[1]
    const newDescription = 'This is a new description'
    const newData = Object.assign({}, contentToModify, {
        description: newDescription
    })

    // update content
    const {updateContent} = await graphqlRequest(updateContentGql, {
        data: newData,
        where: {
            articleId: createArticle.insertedId,
            materializedPath: contentToModify.materializedPath,
            id: contentToModify.id
        }
    }, staticToken.moderator)

    const afterUpdated = await graphqlRequest(articleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    const {deleteArticle} = await graphqlRequest(deleteArticleGql, {where: {id: createArticle.insertedId}}, staticToken.moderator)
    const updatedArticle = afterUpdated.article
    t.is(deleteArticle.deletedCount, 1)
    t.is(updatedArticle.contentElements[1].children[0].children[1].description, newDescription)
    t.is(updatedArticle.contentElements[1].children[0].children[1].type, contentToModify.type)
    t.is(updatedArticle.contentElements[1].children[0].children[1].id, contentToModify.id)
    t.is(updatedArticle.contentElements[1].children[0].children[1].materializedPath, contentToModify.materializedPath)
    t.is(article.contentElements.length, 3)
    t.is(updatedArticle.contentElements[1].children[0].children.length, 3)
})