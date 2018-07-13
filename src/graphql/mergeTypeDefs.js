const {join} = require('path')
const {mergeTypes, fileLoader} = require('merge-graphql-schemas')

const typesArray = fileLoader(join(__dirname, '../modules/'), {
    recursive: true,
    extensions: ['.graphql', '.graphqls', '.gql']
})
const typesMerged = mergeTypes(typesArray, {all: true})

module.exports = typesMerged