const {CollectionNames} = require('../../mongo/enum')

/**
 *
 * @param {Db} db
 */
async function initTagCollection (db) {
    try {
        await db.createCollection(CollectionNames.tags)
        const col = db.collection(CollectionNames.tags)
        await col.createIndex({id: 1}, {unique: true})
        await col.createIndex({slug: 1, projectId: 1, type: 1}, {unique: true})
    } catch (e) {
        throw new Error(e.message)
    }
}

module.exports = {initTagCollection}