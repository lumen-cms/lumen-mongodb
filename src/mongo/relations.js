const {CollectionNames} = require('./enum')

/**
 * @typedef {Object} MongoRelationConfig
 * @property {string} type
 * @property {string} field
 * @property {string} foreignField
 * @property {array} [data]
 */

/**
 *
 * @type {{manyToFew: string, fewToMany: string}}
 */
const RelationTypes = {
    manyToFew: 'manyToFew',
    fewToMany: 'fewToMany'
}

const Relations = {
    [CollectionNames.tags]: {
        [CollectionNames.articles]: {
            type: RelationTypes.manyToFew,
            field: '_meta.' + CollectionNames.articles,
            foreignField: CollectionNames.tags,
            data: ['id', 'title', 'slug'] // need to keep this in sync with gql insert/update
        },
        [CollectionNames.files]: {
            field: 'tags',
            foreignFields: 'id,slug,title'
        }
    },
    [CollectionNames.articles]: {
        [CollectionNames.tags]: {
            type: RelationTypes.fewToMany,
            field: CollectionNames.tags,
            foreignField: '_meta.' + CollectionNames.articles
        }
        // todo files/media
    },
    [CollectionNames.files]: {
        [CollectionNames.tags]: {
            field: '_meta.' + CollectionNames.files,
            foreignField: 'id'
        }
    }
}

module.exports = {Relations, RelationTypes}