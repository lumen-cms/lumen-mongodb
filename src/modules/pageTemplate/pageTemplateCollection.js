const {CollectionNames} = require('../../mongo/enum')

/**
 *
 * @param {Db} db
 */
async function initPageTemplateCollection (db) {
    try {
        await db.createCollection(CollectionNames.pageTemplates)
        const col = db.collection(CollectionNames.pageTemplates)
        await col.createIndex({id: 1}, {unique: true})
        await col.createIndex({key: 1, projectId: 1}, {unique: true})
    } catch (e) {
        throw new Error(e.message)
    }
}

module.exports = {initPageTemplateCollection}