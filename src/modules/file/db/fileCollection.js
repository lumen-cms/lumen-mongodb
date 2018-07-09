const {CollectionNames} = require('../../../mongo/enum')
/**
 *
 * @param {Db} db
 */
async function initFileCollection (db) {
    try {
        await db.createCollection(CollectionNames.files)
        const col = db.collection(CollectionNames.files)
        await col.createIndex({key: 1, projectId: 1}, {unique: true})
        await col.createIndex({id: 1}, {unique: true})
    } catch (e) {
        throw new Error(e.message)
    }
}

module.exports = {initFileCollection}