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
 * @type {{fewToMany: string, oneToMany: string, manyToMany: string}}
 */
const RelationTypes = {
    /**
     * few: array of data
     * many: array of ids
     */
    fewToMany: 'fewToMany',
    /**
     * one: object of data
     * many: array of ids
     */
    oneToMany: 'oneToMany',
    /**
     * many: array of ids
     * many: array of ids
     */
    manyToMany: 'manyToMany'
}

/**
 *
 * @type {[RelationConfiguration]}
 */
const CollectionRelations = [{
    type: RelationTypes.fewToMany,
    few: CollectionNames.articles,
    many: CollectionNames.tags,
    fewField: CollectionNames.tags,
    manyField: '_meta.' + CollectionNames.articles,
    data: ['id', 'title', 'slug']
}, {
    type: RelationTypes.oneToMany,
    few: CollectionNames.articles,
    many: CollectionNames.files,
    fewField: 'previewImage',
    manyField: '_meta.' + CollectionNames.articles + 'PreviewImages',
    data: ['url', 'name', 'width', 'height', 'key']
}]

module.exports = {RelationTypes, CollectionRelations}