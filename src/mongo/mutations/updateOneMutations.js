const ObjectID = require('mongodb').ObjectID

/**
 *
 * @param {Collection} collection
 * @param data
 * @param [context]
 * @returns {Promise<{insertedId:string,acknowledged:boolean}>}
 */
async function insertOneMutation (collection, data, context) {
    data.createdAt = new Date(new Date().toISOString())
    const objectID = new ObjectID()
    data._id = objectID
    data.id = objectID.toString()
    if (context) {
        context.user && (data.createdBy = context.user.id)
        context.projectId && (data.projectId = context.projectId)
    }
    try {
        const r = await collection.insertOne(data)
        return r
    } catch (e) {
        if (e.message.includes('E11000 duplicate')) {
            throw new Error('insert_error_unique')
        }
        throw new Error(e.message)
    }
}

/**
 *
 * @param collection
 * @param find
 * @param rootAuthMutation
 * @return {Promise<Promise|OrderedBulkOperation|void>}
 */
async function deleteOneMutation (collection, find, rootAuthMutation) {
    try {
        return collection.deleteOne(Object.assign({}, find, rootAuthMutation))
    } catch (e) {
        throw new Error(e.message)
    }
}

/**
 *
 * @param {Collection} collection
 * @param {object} find
 * @param {object} data
 * @returns {Promise<{insertedId:string,acknowledged:boolean}>}
 */
async function updateOneMutation (collection, find, data) {
    data.updatedAt = new Date(new Date().toISOString())
    delete data.id
    delete data._id
    Object.keys(find).forEach(key => !find[key] && delete find[key]) // remove unneeded find
    try {
        const r = await collection.updateOne(find, {$set: data})
        return r
    } catch (e) {
        if (e.message.includes('E11000 duplicate')) {
            throw new Error('insert_error_unique')
        }
        throw new Error(e.message)
    }
}

module.exports = {insertOneMutation, deleteOneMutation, updateOneMutation}
