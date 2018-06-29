const ObjectID = require('mongodb').ObjectID

/**
 *
 * @param {Collection} collection
 * @param data
 * @returns {Promise<{insertedId:string,acknowledged:boolean}>}
 */
async function insertOneMutation (collection, data) {
    data.createdAt = new Date().toISOString()
    const objectID = new ObjectID()
    data._id = objectID
    data.id = objectID.toString()
    try {
        return collection.insertOne(data)
    } catch (e) {
        console.log(e)
    }
}

module.exports = {insertOneMutation}
