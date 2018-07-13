const {findRelationsOfCollection} = require('./shared/findRelationsOfCollection')
const {updateManyCollection} = require('./shared/updateManyCollection')
const {Relations, RelationTypes} = require('../../relations')

/**
 *
 * @param db
 * @param collectionName
 * @param idOfUpdate
 * @param data
 * @return {Promise<Array>}
 */
async function createRelatedFields (db, collectionName, idOfUpdate, data) {
    const relations = findRelationsOfCollection(collectionName)
    const updateResults = []
    if (relations.length) {
        relations.forEach(async config => {
            if (config.type === RelationTypes.fewToMany && config.few === collectionName) {
                // update any fewToMany relations. Only few collection will be updated on create
                const r = await updateManyCollection(db, config, idOfUpdate, data, true)
                updateResults.push(r)
            }
        })
    }
    return updateResults
}

module.exports = {createRelatedFields}