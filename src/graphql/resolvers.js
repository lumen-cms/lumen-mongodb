const user = require('../modules/user/resolvers/user')
const auth = require('../modules/user/resolvers/auth')
const article = require('../modules/article/resolver/articleResolver')
const content = require('../modules/article/resolver/contentResolver')
const fileReference = require('../modules/article/resolver/fileReferenceResolver')
const pageTemplate = require('../modules/pageTemplate/pageTemplateResolver')
const tag = require('../modules/tag/tagResolver')
const files = require('../modules/file/fileResolver')
const {Slug, SlugPath} = require('./custom/slugScalarType')
const JSON = require('graphql-type-json')

const {GraphQLDate, GraphQLDateTime} = require('graphql-iso-date')
module.exports = {
    Query: Object.assign(user.Query, auth.Query, article.Query, files.Query, tag.Query, pageTemplate.Query),
    Mutation: Object.assign(user.Mutation, auth.Mutation, article.Mutation, content.Mutation,
        files.Mutation, fileReference.Mutation, tag.Mutation, pageTemplate.Mutation),
    Subscription: Object.assign(user.Subscription),
    GraphQLDate,
    GraphQLDateTime,
    Slug,
    SlugPath,
    JSON
}
