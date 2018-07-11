const {Relations, RelationTypes} = require('../../relations')

/**
 *
 * @param {Db} db
 * @param collectionName
 * @param idOfUpdate
 * @return {Promise<void>}
 */
async function removeRelatedFields (db, collectionName, idOfUpdate) {
    // update related fields
    let updated = {}
    if (Relations.hasOwnProperty(collectionName)) {
        Object.keys(Relations[collectionName]).forEach(async foreignCollectionName => {
            /**
             * @type {MongoRelationConfig}
             */
            const updateConfig = Relations[collectionName][foreignCollectionName]
            if (updateConfig.type === RelationTypes.manyToFew) {
                updated[foreignCollectionName] = await db.collection(foreignCollectionName).updateMany(
                    {[`${updateConfig.foreignField}.id`]: idOfUpdate},
                    {
                        $pull: {
                            [`${updateConfig.foreignField}`]: {id: idOfUpdate}
                        }
                    })
            } else if (updateConfig.type === RelationTypes.fewToMany) {
                updated[foreignCollectionName] = await db.collection(foreignCollectionName).updateMany(
                    {[updateConfig.foreignField]: idOfUpdate},
                    {
                        $pull: {
                            [updateConfig.foreignField]: idOfUpdate
                        }
                    }
                )
            }
        })
    } else {
        return Promise.resolve(true)
    }
    return updated
}

module.exports = {removeRelatedFields}