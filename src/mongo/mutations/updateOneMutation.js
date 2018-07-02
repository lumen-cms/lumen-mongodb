/**
 *
 * @param {Collection} collection
 * @param {object} find
 * @param {object} data
 * @returns {Promise<{insertedId:string,acknowledged:boolean}>}
 */
async function updateOneMutation (collection, find, data) {
    data.updatedAt = new Date(new Date().toISOString())
    delete data.id
    delete data._id
    Object.keys(find).forEach(key => !find[key] && delete find[key]) // remove unneeded find
    try {
        const r = await collection.updateOne(find, {$set: data})
        return r
    } catch (e) {
        if (e.message.includes('E11000 duplicate')) {
            throw new Error('insert_error_unique')
        }
        throw new Error(e.message)
    }
}

module.exports = {updateOneMutation}
