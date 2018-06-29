const user = require('../modules/user/resolvers/user')
const auth = require('../modules/user/resolvers/auth')
const article = require('../modules/article/resolver/articleResolver')
const {Slug, SlugPath} = require('./custom/slugScalarType')

const {GraphQLDate, GraphQLDateTime} = require('graphql-iso-date')
module.exports = {
    Query: Object.assign(user.Query, auth.Query, article.Query),
    Mutation: Object.assign(user.Mutation, auth.Mutation, article.Mutation),
    Subscription: Object.assign(user.Subscription),
    GraphQLDate,
    GraphQLDateTime,
    Slug,
    SlugPath
}
