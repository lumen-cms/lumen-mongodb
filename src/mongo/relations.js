const {CollectionNames} = require('./enum')
const Relations = {
    [CollectionNames.tags]: {
        [CollectionNames.articles]: {
            field: 'tags',
            foreignFields: 'id,slug,title'
        },
        [CollectionNames.files]: {
            field: 'tags',
            foreignFields: 'id,slug,title'
        }
    },
    [CollectionNames.articles]: {
        [CollectionNames.tags]: {
            field: '_meta.' + CollectionNames.articles,
            foreignFields: 'id'
        }
    },
    [CollectionNames.files]: {
        [CollectionNames.tags]: {
            field: '_meta.' + CollectionNames.files,
            foreignFields: 'id'
        }
    }
}

module.exports = {Relations}