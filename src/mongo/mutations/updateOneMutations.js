const ObjectID = require('mongodb').ObjectID

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
    data._id = objectID
    data.id = objectID.toString()
    if (context) {
        context.user && (data.createdBy = context.user.id)
        context.projectId && (data.projectId = context.projectId)
    }
    try {
        const r = await db.collection(collectionName).insertOne(data)
        return r
    } catch (e) {
        if (e.message.includes('E11000 duplicate')) {
            return Promise.reject('insert_error_unique')
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
        // if(main.deleted = 1)
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
        return r
    } catch (e) {
        if (e.message.includes('E11000 duplicate')) {
            return Promise.reject('insert_error_unique')
        }
        return Promise.reject(e.message)
    }
}

module.exports = {insertOneMutation, deleteOneMutation, updateOneMutation}
