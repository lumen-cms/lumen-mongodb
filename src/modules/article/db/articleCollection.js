const {CollectionNames} = require('../../../mongo/enum')

const validation = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['slug', 'title', 'languageKey'],
        properties: {
            _id: {
                bsonType: 'objectId'
            },
            id: {
                bsonType: 'string'
            },
            slug: {
                bsonType: 'string'
            },
            title: {
                bsonType: 'string'
            },
            languageKey: {
                bsonType: 'string'
            }
        }
    }
}


/**
 *
 * @param {Db} db
 */
async function initArticleCollection (db) {
    try {
        await db.createCollection(CollectionNames.articles, {validator: validation})
        const col = db.collection(CollectionNames.articles)
        await col.createIndex({slug: 1}, {unique: true})
    } catch (e) {
        console.log(e)
        throw new Error(e)
    }
}

module.exports = {initArticleCollection}