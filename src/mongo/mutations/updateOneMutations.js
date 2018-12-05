const {ObjectID} = require('mongodb')
const {updateRelatedFields} = require('./relations/updateRelatedFields')
const {createRelatedFields} = require('./relations/createRelatedFields')
const {removeRelatedFields} = require('./relations/removeRelatedFields')

/**
 *
 * @param {Db} db
 * @param {string} collectionName
 * @param data
 * @param [context]
 * @returns {Promise<{insertedId:string,acknowledged:boolean}>}
 */
async function insertOneMutation (db, collectionName, data, context) {
    data.createdAt = new Date(new Date().toISOString())
    const objectID = new ObjectID()
    // @TODO https://github.com/apollographql/apollo-server/issues/1649#issuecomment-420840287
    data._id = objectID.toString()
    data.id = objectID.toString()
    if (context) {
        context.user && (data.createdBy = context.user.id)
        context.projectId && (data.projectId = context.projectId)
    }
    try {
        const insert = await db.collection(collectionName).insertOne(data)

        // update related fields
        if (insert.insertedId) {
            const insertedIdAsString = insert.insertedId.toString()
            await createRelatedFields(db, collectionName, insertedIdAsString, data)
        }

        return insert
    } catch (e) {
        if (e.message.includes('E11000 duplicate')) {
            return Promise.reject(`insert_error_unique of collection "${collectionName}"`)
        }
        return Promise.reject(e.message)
    }
}

/**
 *
 * @param {Db} db
 * @param {string} collectionName
 * @param find
 * @param rootAuthMutation
 * @return {Promise<Promise|OrderedBulkOperation|void>}
 */
async function deleteOneMutation (db, collectionName, find, rootAuthMutation) {
    try {
        const main = await db.collection(collectionName).deleteOne(Object.assign({}, find, rootAuthMutation))
        // update related collections
        if (main.deletedCount === 1) {
            await removeRelatedFields(db, collectionName, find.id)
        }
        return main
    } catch (e) {
        return Promise.reject(e)
    }
}

/**
 *
 * @param {Db} db
 * @param {string} collectionName
 * @param {object} find
 * @param {object} data
 * @returns {Promise<{insertedId:string,acknowledged:boolean}>}
 */
async function updateOneMutation (db, collectionName, find, data) {
    data.updatedAt = new Date(new Date().toISOString())
    delete data.id
    delete data._id
    Object.keys(find).forEach(key => !find[key] && delete find[key]) // remove unneeded find
    try {
        const r = await db.collection(collectionName).updateOne(find, {$set: data})
        if (r.modifiedCount === 1) {
            await updateRelatedFields(db, collectionName, find.id, data)
        }
        return r
    } catch (e) {
        if (e.message.includes('E11000 duplicate')) {
            return Promise.reject('insert_error_unique')
        }
        return Promise.reject(e.message)
    }
}

module.exports = {insertOneMutation, deleteOneMutation, updateOneMutation}
