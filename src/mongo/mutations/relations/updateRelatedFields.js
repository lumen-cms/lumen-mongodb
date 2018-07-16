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
async function updateOneOrFewCollection (db, updateConfig, idOfUpdate, data) {
    const dataToUpdate = Object.assign(
        _pick(data, updateConfig.data),
        {id: idOfUpdate}
    ) // need to make sure that inside of data is everything what needs to be updated
    const allFieldsSet = Object.keys(dataToUpdate).every(i => !!dataToUpdate[i])
    if (!allFieldsSet) {
        console.log('some related fields not set correctly: ' + JSON.stringify(updateConfig) + ' ' + JSON.stringify(dataToUpdate))
        return
    }
    const setMongoField = updateConfig.type === RelationTypes.fewToMany ? `${updateConfig.fewField}.$` : updateConfig.fewField
    return db.collection(updateConfig.few).updateMany(
        {[`${updateConfig.fewField}.id`]: idOfUpdate},
        {
            $set: {
                [setMongoField]: dataToUpdate
            }
        })
}

/**
 *
 * @param {Db} db
 * @param {RelationConfiguration} updateConfig
 * @param {string} idOfUpdate
 * @param {object} data
 * @return {Promise<void>}
 */
async function updateOneCollection (db, updateConfig, idOfUpdate, data) {
    const dataToUpdate = Object.assign(
        _pick(data, updateConfig.data),
        {id: idOfUpdate}
    ) // need to make sure that inside of data is everything what needs to be updated
    const allFieldsSet = Object.keys(dataToUpdate).every(i => !!dataToUpdate[i])
    if (!allFieldsSet) {
        console.log('some related fields not set correctly: ' + JSON.stringify(updateConfig) + ' ' + JSON.stringify(dataToUpdate))
        return
    }
    return db.collection(updateConfig.few).updateMany(
        {[`${updateConfig.fewField}.id`]: idOfUpdate},
        {
            $set: {
                [`${updateConfig.fewField}`]: dataToUpdate
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
            if ([RelationTypes.fewToMany, RelationTypes.oneToMany].includes(config.type) && config.few === collectionName) {
                // update "many" collection
                updateResults[config.many] = await updateManyCollection(db, config, idOfUpdate, data)
            } else if ([RelationTypes.fewToMany, RelationTypes.oneToMany].includes(config.type) && config.many === collectionName) {
                // update "few" collection
                updateResults[config.few] = await updateOneOrFewCollection(db, config, idOfUpdate, data)
            }
        })
    }

    return updateResults
}

module.exports = {updateRelatedFields}