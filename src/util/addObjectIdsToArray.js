const {ObjectID} = require('mongodb')

/**
 *
 * @return {string}
 */
function createObjectIdString () {
    return new ObjectID().toString()
}

/**
 *
 * @param {array} array
 * @param {string} childKey
 * @param {string|undefined|null} path
 * @return {*}
 */
function addObjectIdsToArray (array, childKey, path = '') {
    return array.map((e, i) => {

        if (Array.isArray(e[childKey])) {
            e[childKey] = addObjectIdsToArray(e[childKey], childKey, `${path}${i},`)
        }
        if (e.fileReferences && e.fileReferences.length) {
            e.fileReferences = e.fileReferences.map(i => Object.assign({}, i, {id: createObjectIdString()}))
        }
        if (e.backgroundFileReferences && e.backgroundFileReferences.length) {
            e.backgroundFileReferences = e.backgroundFileReferences.map(i => Object.assign({}, i, {id: createObjectIdString()}))
        }
        return Object.assign(
            e,
            {
                id: createObjectIdString(),
                materializedPath: path
            }
        )
    })
}

/**
 *
 * @param materializedPath
 * @return {{queryPath: string, mutationPath: string, getPath: string}}
 */
function getMaterializedMongoModifier (materializedPath) {
    let queryPath = 'contentElements'
    let mutationPath = 'contentElements'
    let getPath = 'contentElements'
    const splittedPath = materializedPath.split(',')
    splittedPath.forEach((key, i) => {
        if (!key) return
        queryPath += '.children'
        mutationPath += (i + 1) === splittedPath.length ? '.children' : `.${key}.children`
        getPath += `[${key}].children`
    })

    return {
        queryPath: queryPath + '.id',
        mutationPath,
        getPath
    }
}

module.exports = {
    addObjectIdsToArray,
    getMaterializedMongoModifier,
    createObjectIdString
}