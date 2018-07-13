const {CollectionNames} = require('./enum')

/**
 * @typedef {Object} RelationConfiguration
 * @property {string} type
 * @property {string} few
 * @property {string} many
 * @property {string} fewField
 * @property {string} manyField
 * @property {string} one
 * @property {string} oneField
 * @property {array} [data]
 */


/**
 *
 * @type {{manyToFew: string, fewToMany: string}}
 */
const RelationTypes = {
    fewToMany: 'fewToMany',
    oneToMany: 'oneToMany',
    manyToMany: 'manyToMany'
}

/**
 *
 * @type {*[]}
 */
const CollectionRelations = [{
    type: RelationTypes.fewToMany,
    few: CollectionNames.articles,
    many: CollectionNames.tags,
    fewField: CollectionNames.tags,
    manyField: '_meta.' + CollectionNames.articles,
    data: ['id', 'title', 'slug']
}]

module.exports = {RelationTypes, CollectionRelations}