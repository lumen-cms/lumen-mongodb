import test from 'ava'
import {staticToken, graphqlRequest} from '../../util/graphqlRequest'
import {
    createPageTemplateGql,
    deletePageTemplateGql,
    findPageTemplatesGql,
    updatePageTemplateGql
} from '../../util/pageTemplateGqlStatements'


const testData = {
    body: 'some body',
    bodyJson: {
        some: 'toll',
        duda: 'mega',
        di: 1
    },
    key: 'title-of-json',
    languageKey: 'de',
    title: 'title of json',
    type: 'JSON'
}

test('create page template should fail if not logged in', async t => {
    const e = await t.throws(graphqlRequest(createPageTemplateGql, {data: testData}))
    t.is(e.message.includes('Not Authorised'), true)
})

test('crud on page template', async t => {
    const {pageTemplatesCreateOne} = await graphqlRequest(createPageTemplateGql, {data: testData},staticToken.moderator)
    const insertedId = pageTemplatesCreateOne.insertedId
    const {pageTemplates} = await graphqlRequest(findPageTemplatesGql, {where: {id: {EQ:insertedId}}})
    const newTitle = 'changed title of this thing'
    const {pageTemplatesUpdateOne} = await graphqlRequest(updatePageTemplateGql, {
        where: {id: insertedId},
        data: Object.assign({}, testData, {title: newTitle})
    },staticToken.moderator)
    const findAfterUpdate = await graphqlRequest(findPageTemplatesGql, {where: {id: {EQ:insertedId}}})
        .then(r => r.pageTemplates)

    const {pageTemplatesDeleteOne} = await graphqlRequest(deletePageTemplateGql, {where: {id: insertedId}},staticToken.moderator)

    t.is(typeof pageTemplatesCreateOne.insertedId, 'string')
    t.is(pageTemplates.length, 1)
    t.is(pageTemplatesUpdateOne.modifiedCount, 1)
    t.is(pageTemplatesDeleteOne.deletedCount, 1)
    t.is(pageTemplates[0].title, testData.title)
    t.is(pageTemplates[0].type, testData.type)
    t.is(findAfterUpdate[0].title, newTitle)
})