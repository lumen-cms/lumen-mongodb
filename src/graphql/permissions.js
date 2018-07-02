const {UserRole} = require('../mongo/enum')
const {rule, shield, and, or, not} = require('graphql-shield')
// Rules

const isAuthenticated = rule()(async (parent, args, {projectId, user}) => {
    return user !== null &&
        user.permissions &&
        user.permissions.some(i => i.projectId === projectId)
})

const isOperator = rule()(async (parent, args, ctx) => {
    return ctx.user.role === UserRole.OPERATOR
})


const isAdmin = rule()(async (parent, args, ctx) => {
    return ctx.user.role === UserRole.ADMIN
})

const isModerator = rule()(async (parent, args, ctx) => {
    return ctx.user.role === UserRole.MODERATOR
})

const isEditor = rule()(async (parent, args, ctx) => {
    return ctx.user.role === UserRole.EDITOR
})


// Permissions

const permissions = shield({
    Query: {
        // frontPage: not(isAuthenticated),
        // fruits: and(isAuthenticated, or(isAdmin, isEditor)),
        // customers: and(isAuthenticated, isAdmin)
    },
    Mutation: {
        createArticle: and(isAuthenticated),
        // deleteArticle: and(isAuthenticated)
        // addFruitToBasket: isAuthenticated
    }
    // Fruit: isAuthenticated,
    // Customer: isAdmin
})

module.exports = {permissions}

