const slugify = require('slugify')
const {GraphQLScalarType} = require('graphql')

function slugifyValue (value) {
    console.log('inside of slug thingy')
    return slugify(value, {lower: true}) // value from the client
}

function slugifyPath (string) {
    return string.indexOf('/') !== -1
        ? string.split('/').map(e => slugifyValue(e)).filter(e => e).join('/')
        : slugifyValue(string)
}

module.exports = {
    Slug: new GraphQLScalarType({
        name: 'Slug',
        description: 'String parsed with slugify',
        parseValue: slugifyValue,
        serialize: slugifyValue,
        parseLiteral: (ast) => {
            return slugifyValue(ast.value)
        }
    }),
    SlugPath: new GraphQLScalarType({
        name: 'SlugPath',
        description: 'Slug for path includes "/"',
        parseValue: slugifyPath,
        serialize: slugifyPath,
        parseLiteral: (ast) => {
            return slugifyPath(ast.value)
        }
    })
}