import test from 'ava'
import {staticToken, graphqlRequest} from '../../util/graphqlRequest'
import {createTagGql, deleteTagGql, findTagsGql, updateTagGql} from '../../util/tagGqlStatements'

const testData = {
    languageKey: 'de',
    title: 'some title',
    type: 'article',
    slug: 'some slug'
}

test('create tag should fail if not logged in', async t => {
    const e = await t.throwsAsync(() => graphqlRequest(createTagGql, {data: testData}))
    t.is(e.message.includes('Not Authorised'), true)
})

test('crud on collection tags', async t => {
    const {tagsCreateOne} = await graphqlRequest(createTagGql, {data: testData}, staticToken.moderator)
    const insertedId = tagsCreateOne.insertedId
    const {tags} = await graphqlRequest(findTagsGql, {where: {id: {EQ: insertedId}}}, staticToken.moderator)
    const newTitle = 'another title'
    const {tagsUpdateOne} = await graphqlRequest(updateTagGql, {
        where: {id: insertedId},
        data: Object.assign({}, testData, {title: newTitle})
    }, staticToken.moderator)
    const findAfterUpdate = await graphqlRequest(findTagsGql, {where: {id: {EQ: insertedId}}}, staticToken.moderator)
        .then(r => r.tags)
    const {tagsDeleteOne} = await graphqlRequest(deleteTagGql, {where: {id: insertedId}}, staticToken.moderator)
    t.is(typeof insertedId, 'string')
    t.is(tags.length, 1)
    t.is(tagsUpdateOne.modifiedCount, 1)
    t.is(tagsDeleteOne.deletedCount, 1)
    t.is(tags[0].title, testData.title)
    t.is(tags[0].type, testData.type)
    t.is(findAfterUpdate[0].title, newTitle)
})
