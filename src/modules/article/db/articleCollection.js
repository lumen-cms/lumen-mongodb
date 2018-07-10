const {CollectionNames} = require('../../../mongo/enum')

/**
 *
 * @param {Db} db
 */
async function initArticleCollection (db) {
    try {
        await db.createCollection(CollectionNames.articles)
        const col = db.collection(CollectionNames.articles)
        await col.createIndex({slug: 1, projectId: 1}, {unique: true})
        await col.createIndex({id: 1}, {unique: true})
    } catch (e) {
        throw new Error(e.message)
    }
}

module.exports = {initArticleCollection}