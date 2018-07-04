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
 * @param {string} path
 * @return {*}
 */
function addObjectIdsToArray (array, childKey, path = '') {
    return array.map((e, i) => {
        const currentPath = `${path}${i},`
        if (Array.isArray(e[childKey])) {
            e[childKey] = addObjectIdsToArray(e[childKey], childKey, currentPath)
        }
        return Object.assign(
            e,
            {
                id: createObjectIdString(),
                materializedPath: currentPath
            }
        )
    })
}

/**
 *
 * @param materializedPath
 * @return {{queryPath: string, mutationPath: string, lastIndex: number}}
 */
function getMaterializedMongoModifier (materializedPath) {
    let path = 'contentElements'
    materializedPath.split(',')
        .forEach((key, i) => {
            if (!key) return
            path += (i > 0) ? `.children.${key}` : `.${key}`
        })

    const splitted = path.split('.')
    const lastIndex = splitted.pop()
    return {
        queryPath: path + '.id',
        mutationPath: splitted.join('.'),
        lastIndex: Number(lastIndex)
    }
}

module.exports = {
    addObjectIdsToArray,
    getMaterializedMongoModifier,
    createObjectIdString
}