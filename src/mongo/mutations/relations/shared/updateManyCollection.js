const _get = require('lodash.get')

/**
 *
 * @param {Db} db
 * @param {RelationConfiguration} updateConfig
 * @param {string} idOfUpdate
 * @param {object} data
 * @param {boolean} [isCreate]
 * @return {Promise<void>}
 */
async function updateManyCollection (db, updateConfig, idOfUpdate, data, isCreate) {
    const modif = {}
    const selected = _get(data, [updateConfig.fewField])
    if (!selected) {
        return // selected is not set so don't update any relations
    }
    // remove all possible connections in case of update
    if (!isCreate) {
        modif.removed = await db.collection(updateConfig.many).updateMany(
            {[updateConfig.manyField]: idOfUpdate}, {
                $pull: {
                    [updateConfig.manyField]: idOfUpdate
                }
            })
    }
    const selectedIds = Array.isArray(selected) ? selected.map(e => e.id) : [selected.id]

    if (!selectedIds.filter(e => e).length) {
        // don't add any items if nothing is set
        console.log('some id missing on related collection: '+JSON.stringify(updateConfig))
    }
    // add current connection
    modif.added = await db.collection(updateConfig.many).updateMany(
        {id: {$in: selectedIds}},
        {
            $addToSet: {
                [updateConfig.manyField]: idOfUpdate
            }
        })
    return modif
}

module.exports = {updateManyCollection}