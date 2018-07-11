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
    const {createPageTemplate} = await graphqlRequest(createPageTemplateGql, {data: testData},staticToken.moderator)
    const {findPageTemplates} = await graphqlRequest(findPageTemplatesGql, {where: {id: createPageTemplate.insertedId}})
    const newTitle = 'changed title of this thing'
    const {updatePageTemplate} = await graphqlRequest(updatePageTemplateGql, {
        where: {id: createPageTemplate.insertedId},
        data: Object.assign({}, testData, {title: newTitle})
    },staticToken.moderator)
    const findAfterUpdate = await graphqlRequest(findPageTemplatesGql, {where: {id: createPageTemplate.insertedId}})
        .then(r => r.findPageTemplates)

    const {deletePageTemplate} = await graphqlRequest(deletePageTemplateGql, {where: {id: createPageTemplate.insertedId}},staticToken.moderator)

    t.is(typeof createPageTemplate.insertedId, 'string')
    t.is(findPageTemplates.length, 1)
    t.is(updatePageTemplate.modifiedCount, 1)
    t.is(deletePageTemplate.deletedCount, 1)
    t.is(findPageTemplates[0].title, testData.title)
    t.is(findPageTemplates[0].type, testData.type)
    t.is(findAfterUpdate[0].title, newTitle)
})