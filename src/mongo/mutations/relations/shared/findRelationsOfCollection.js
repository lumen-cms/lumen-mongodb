const {CollectionRelations} = require('../../../relations')

/**
 *
 * @param collectionName
 * @return {Array.<RelationConfiguration>}
 */
function findRelationsOfCollection (collectionName) {
    return CollectionRelations.filter(config =>
        config.few === collectionName || config.many === collectionName || config.one === collectionName)
}

module.exports = {findRelationsOfCollection}