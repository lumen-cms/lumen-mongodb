const {documentExists} = require('../mongo/mutations/documentExists')
const CollectionNames = require('../mongo/enum').CollectionNames
const {UserRole} = require('../mongo/enum')
const {rule, shield, and, or, not} = require('graphql-shield')
// Rules

const isAuthenticated = rule()(async (parent, args, {projectId, user}) => {
    return user !== null &&
        user.permissions &&
        user.permissions.some(i => i.projectId === projectId)
})

const isOperator = rule()(async (parent, args, {projectId, user}) => {
    return user !== null &&
        user.permissions &&
        user.permissions.some(i => i.projectId === projectId && i.role === UserRole.OPERATOR)
})


const isAdmin = rule()(async (parent, args, {projectId, user}) => {
    const permitted = user !== null &&
        user.permissions &&
        user.permissions.some(i => i.projectId === projectId && i.role === UserRole.OPERATOR)
    return permitted
})

const isModerator = rule()(async (parent, args, {projectId, user}) => {
    const permitted = user !== null &&
        user.permissions &&
        user.permissions.some(i => i.projectId === projectId && i.role === UserRole.MODERATOR)
    return permitted
})

const isGuest = rule()(async (parent, args, {projectId, user}) => {
    const permitted = user !== null &&
        user.permissions &&
        user.permissions.some(i => i.projectId === projectId && i.role === UserRole.GUEST)
    return permitted
})

const isOwnerOfArticle = rule()(async (parent, {where}, {user, db}) => {
    const find = {
        createdBy: user.id
    }
    Object.assign(where, find)
    const exists = await documentExists(db.collection(CollectionNames.articles), find)
    return exists
})

// Permissions

const permissions = shield({
    Query: {
        // frontPage: not(isAuthenticated),
        // fruits: and(isAuthenticated, or(isAdmin, isEditor)),
        // customers: and(isAuthenticated, isAdmin)
    },
    Mutation: {
        createArticle: isAuthenticated,
        deleteArticle: or(isModerator, isAdmin, and(isOwnerOfArticle, isGuest)),
        updateArticle: or(isModerator, isAdmin, and(isOwnerOfArticle, isGuest))
    }
    // Fruit: isAuthenticated,
    // Customer: isAdmin
})

module.exports = {permissions}

