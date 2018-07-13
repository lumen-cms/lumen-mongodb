const {findRelationsOfCollection} = require('./shared/findRelationsOfCollection')
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
    const relations = findRelationsOfCollection(collectionName)
    const updateResults = {}
    if (relations.length) {
        relations.forEach(async config => {
            if (config.type === RelationTypes.fewToMany && config.many === collectionName) {
                // update few relation
                updateResults[config.few] = await db.collection(config.few).updateMany(
                    {[`${config.fewField}.id`]: idOfUpdate},
                    {
                        $pull: {
                            [`${config.fewField}`]: {id: idOfUpdate}
                        }
                    })
            } else if (config.type === RelationTypes.fewToMany && config.few === collectionName) {
                updateResults[config.many] = await db.collection(config.many).updateMany(
                    {[config.manyField]: idOfUpdate},
                    {
                        $pull: {
                            [config.manyField]: idOfUpdate
                        }
                    }
                )
            }
        })
    }
    return updateResults
}

module.exports = {removeRelatedFields}