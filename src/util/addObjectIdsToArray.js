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
 * @return {{queryPath: string, mutationPath: string, lastIndex: number}}
 */
function getMaterializedMongoModifier (materializedPath) {
    let queryPath = 'contentElements'
    let mutationPath = 'contentElements'
    const splittedPath = materializedPath.split(',')
    splittedPath.forEach((key, i) => {
        if (!key) return
        queryPath += '.children'
        if ((i + 1) === splittedPath.length) {
            mutationPath += '.children'
        } else {
            mutationPath += `.${key}.children`
        }
    })

    return {
        queryPath: queryPath + '.id',
        mutationPath
    }

    // const splitted = path.split('.')
    // const lastIndex = splitted.pop()
    // return {
    //     queryPath: path + '.id',
    //     mutationPath: splitted.join('.'),
    //     lastIndex: Number(lastIndex)
    // }
}

module.exports = {
    addObjectIdsToArray,
    getMaterializedMongoModifier,
    createObjectIdString
}