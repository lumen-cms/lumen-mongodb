/**
 * @description reliable fast lookup if document exists
 *
 * @param {Collection} collection
 * @param {object} find
 * @return {Promise<boolean>}
 */
async function documentExists (collection, find) {
    Object.keys(find).forEach(key => !find[key] && delete find[key]) // remove unneeded find
    const documentCount = await collection.find(find, {id: 1}).limit(1).count()
    return documentCount > 0
}

module.exports = {documentExists}