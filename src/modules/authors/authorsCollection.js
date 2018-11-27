const {CollectionNames} = require('../../mongo/enum')

/**
 *
 * @param {Db} db
 */
async function initAuthorCollection (db) {
  try {
    await db.createCollection(CollectionNames.authors)
    const col = db.collection(CollectionNames.authors)
    await col.createIndex({id: 1}, {unique: true})
  } catch (e) {
    throw new Error(e.message)
  }
}

module.exports = {initAuthorCollection}