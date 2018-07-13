const {join} = require('path')
const {fileLoader, mergeResolvers} = require('merge-graphql-schemas')
const JSON = require('graphql-type-json')
const {GraphQLDate, GraphQLDateTime} = require('graphql-iso-date')
const resolverArrayFromFiles = fileLoader(join(__dirname, '../modules/**/*.resolver.js'))
const resolvers = mergeResolvers(resolverArrayFromFiles)

module.exports = Object.assign(resolvers, {JSON}, {GraphQLDateTime}, {GraphQLDate})