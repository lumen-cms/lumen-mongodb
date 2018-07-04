/**
 * @description fast lookup if document exists
 *
 * @param {Collection} collection
 * @param {object} find
 * @return {Promise<boolean>}
 */
async function documentExists (collection, find) {
    const count = await documentCount(collection, find)
    return count > 0
}

/**
 * @description fast lookup if document exists
 *
 * @param {Collection} collection
 * @param {object} find
 * @return {Promise<boolean>}
 */
async function documentExistsOnce (collection, find) {
    const count = await documentCount(collection, find)
    return count === 1
}

/**
 *
 * @param {Collection} collection
 * @param find
 * @return {Promise<number>}
 */
async function documentCount (collection, find) {
    Object.keys(find).forEach(key => !find[key] && delete find[key]) // remove unneeded find
    const count = await collection
        .find(find)
        .project({_id: 1})
        .count()
    return count
}


module.exports = {documentExists, documentCount, documentExistsOnce}