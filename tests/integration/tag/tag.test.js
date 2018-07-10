import test from 'ava'
import {staticToken, graphqlRequest} from '../../../_util/graphqlRequest'
import {createTagGql, deleteTagGql, findTagsGql, updateTagGql} from '../../../_util/tagGqlStatements'

const testData = {
    languageKey: 'de',
    title: 'some title',
    type: 'article',
    slug: 'some slug'
}

test('create tag should fail if not logged in', async t => {
    const e = await t.throws(graphqlRequest(createTagGql, {data: testData}))
    t.is(e.message.includes('Not Authorised'), true)
})

test('crud on collection tags', async t => {
    const {createTag} = await graphqlRequest(createTagGql, {data: testData}, staticToken.moderator)
    const {findTags} = await graphqlRequest(findTagsGql, {where: {id: createTag.insertedId}}, staticToken.moderator)
    const newTitle = 'another title'
    const {updateTag} = await graphqlRequest(updateTagGql, {
        where: {id: createTag.insertedId},
        data: Object.assign({}, testData, {title: newTitle})
    }, staticToken.moderator)
    const findAfterUpdate = await graphqlRequest(findTagsGql, {where: {id: createTag.insertedId}}, staticToken.moderator)
        .then(r => r.findTags)
    const {deleteTag} = await graphqlRequest(deleteTagGql, {where: {id: createTag.insertedId}}, staticToken.moderator)
    t.is(typeof createTag.insertedId, 'string')
    t.is(findTags.length, 1)
    t.is(updateTag.modifiedCount, 1)
    t.is(deleteTag.deletedCount, 1)
    t.is(findTags[0].title, testData.title)
    t.is(findTags[0].type, testData.type)
    t.is(findAfterUpdate[0].title, newTitle)
})