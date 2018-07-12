const {SchemaDirectiveVisitor} = require('graphql-tools')
const {GraphQLObjectType, GraphQLString} = require('graphql')
const gqlToMongo = require('graphql-to-mongodb')

const SearchTypes = {
    TagSearch: new GraphQLObjectType({
        name: 'TagSearch',
        fields: () => ({
            title: {type: GraphQLString}
        })
    })
}

// todo not working currently.. https://github.com/Soluto/graphql-to-mongodb/issues/14

class FilterTypeDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition (field) {
        const type = field.args[0].type

        console.log('inside of field definition', type)
        const currentObjectType = SearchTypes[type]
        const queryArgs = gqlToMongo.getMongoDbFilter(currentObjectType)
        field.args = Object.keys(queryArgs).map(key => Object.assign({}, queryArgs[key], {
            name: key
        }))
        console.log(field.args)
        if (!field.resolve) {
            field.resolve = function () {
            }
        }
        field.resolve = gqlToMongo.getMongoDbQueryResolver(currentObjectType, field.resolve)
    }
}

module.exports = {FilterTypeDirective}