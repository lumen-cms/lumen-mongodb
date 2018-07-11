const _get = require('lodash.get')
const _pick = require('lodash.pick')
const {Relations, RelationTypes} = require('../../relations')

/**
 *
 * @param {Db} db
 * @param {MongoRelationConfig} updateConfig
 * @param {string} foreignCollectionName
 * @param {string} idOfUpdate
 * @param {object} data
 * @return {Promise<void>}
 */
async function updateManyToFew (db, updateConfig, foreignCollectionName, idOfUpdate, data) {
    const dataToUpdate = Object.assign(
        _pick(data, updateConfig.data),
        {id: idOfUpdate}
    ) // need to make sure that inside of data is everything what needs to be updated
    return db.collection(foreignCollectionName).updateMany(
        {[`${updateConfig.foreignField}.id`]: idOfUpdate},
        {
            $set: {
                [`${updateConfig.foreignField}.$`]: dataToUpdate
            }
        })
}

/**
 *
 * @param {Db} db
 * @param {MongoRelationConfig} updateConfig
 * @param {string} foreignCollectionName
 * @param {string} idOfUpdate
 * @param {object} data
 * @param {boolean} [isCreate]
 * @return {Promise<void>}
 */
async function updateFewToMany (db, updateConfig, foreignCollectionName, idOfUpdate, data, isCreate) {
    const selected = _get(data, [updateConfig.field])
    if (!selected) {
        return // selected is not set so don't update any relations
    }
    // remove all possible connections in case of update
    if (!isCreate) {
        await db.collection(foreignCollectionName).updateMany(
            {[updateConfig.foreignField]: idOfUpdate}, {
                $pull: {
                    [updateConfig.foreignField]: idOfUpdate
                }
            })
    }
    const selectedIds = Array.isArray(selected) ? selected.map(e => e.id) : [selected.id]
    if (!selectedIds.length) {
        // don't add any items if nothing is set
        return
    }
    // add current connection
    await db.collection(foreignCollectionName).updateMany(
        {id: {$in: selectedIds}},
        {
            $addToSet: {
                [updateConfig.foreignField]: idOfUpdate
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
    // update related fields
    if (Relations.hasOwnProperty(collectionName)) {
        Object.keys(Relations[collectionName]).forEach(async foreignCollectionName => {
            /**
             * @type {MongoRelationConfig}
             */
            const updateConfig = Relations[collectionName][foreignCollectionName]
            if (updateConfig.type === RelationTypes.fewToMany) {
                await updateFewToMany(db, updateConfig, foreignCollectionName, idOfUpdate, data)
            } else if (updateConfig.type === RelationTypes.manyToFew) {
                await updateManyToFew(db, updateConfig, foreignCollectionName, idOfUpdate, data)
            }
        })
    }
}

module.exports = {updateRelatedFields, updateFewToMany}