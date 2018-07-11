const {updateFewToMany} = require('./updateRelatedFields')
const {Relations, RelationTypes} = require('../../relations')

async function createRelatedFields (db, collectionName, idOfUpdate, data) {
    if (Relations.hasOwnProperty(collectionName)) {
        Object.keys(Relations[collectionName]).forEach(async foreignCollectionName => {
            /**
             * @type {MongoRelationConfig}
             */
            const updateConfig = Relations[collectionName][foreignCollectionName]
            if (updateConfig.type === RelationTypes.fewToMany) {
                await updateFewToMany(db, updateConfig, foreignCollectionName, idOfUpdate, data, true)
            }
        })
    }
}

module.exports = {createRelatedFields}