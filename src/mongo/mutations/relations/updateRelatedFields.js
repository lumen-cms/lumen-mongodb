const _pick = require('lodash.pick')
const {updateManyCollection} = require('./shared/updateManyCollection')
const {findRelationsOfCollection} = require('./shared/findRelationsOfCollection')
const {RelationTypes} = require('../../relations')

/**
 *
 * @param {Db} db
 * @param {RelationConfiguration} updateConfig
 * @param {string} idOfUpdate
 * @param {object} data
 * @return {Promise<void>}
 */
async function updateFewCollection (db, updateConfig, idOfUpdate, data) {
    const dataToUpdate = Object.assign(
        _pick(data, updateConfig.data),
        {id: idOfUpdate}
    ) // need to make sure that inside of data is everything what needs to be updated
    return db.collection(updateConfig.few).updateMany(
        {[`${updateConfig.fewField}.id`]: idOfUpdate},
        {
            $set: {
                [`${updateConfig.fewField}.$`]: dataToUpdate
            }
        })
}

/**
 *
 * @param {Db} db
 * @param {string} collectionName
 * @param {string} idOfUpdate
 * @param {object} data
 * @return {Promise<void>}
 */
async function updateRelatedFields (db, collectionName, idOfUpdate, data) {
    const relations = findRelationsOfCollection(collectionName)
    const updateResults = {}
    if (relations.length) {
        relations.forEach(async config => {
            if (config.type === RelationTypes.fewToMany && config.few === collectionName) {
                // update many
                updateResults[config.many] = await updateManyCollection(db, config, idOfUpdate, data)
            } else if (config.type === RelationTypes.fewToMany && config.many === collectionName) {
                //
                updateResults[config.few] = await updateFewCollection(db, config, idOfUpdate, data)
            }
        })
    }

    return updateResults
}

module.exports = {updateRelatedFields}