const {documentExists} = require('../../mongo/mutations/documentExists')
const CollectionNames = require('../../mongo/enum').CollectionNames
const {UserRole} = require('../../mongo/enum')
const {rule, shield, and, or} = require('graphql-shield')
// Rules

const isAuthenticated = rule()(async (parent, args, {user}) => {
    return !!user
})

const isOperator = rule()(async (parent, args, {permission}) => {
    return permission === UserRole.OPERATOR
})


const isAdmin = rule()(async (parent, args, {permission}) => {
    const permitted = permission === UserRole.OPERATOR
    return permitted
})

const isModerator = rule()(async (parent, args, {permission}) => {
    const permitted = permission === UserRole.MODERATOR
    return permitted
})

const isGuest = rule()(async (parent, args, {permission}) => {
    const permitted = permission === UserRole.GUEST
    return permitted
})

/**
 *
 * @type {Rule}
 */
const isOwnerOfArticle = rule()(async (parent, {where}, {user, db}) => {
    const find = {
        createdBy: user.id
    }
    Object.assign(where, find)
    const exists = await documentExists(db.collection(CollectionNames.articles), find)
    return exists
})

const isOwnerOfFile = rule()(async (parent, {where}, {user, db}) => {
    const find = {
        createdBy: user.id
    }
    Object.assign(where, find)
    const exists = await documentExists(db.collection(CollectionNames.files), find)
    return exists
})

const isOwnerOfTag = rule()(async (parent, {where}, {user, db}) => {
    const find = {
        createdBy: user.id
    }
    Object.assign(where, find)
    const exists = await documentExists(db.collection(CollectionNames.tags), find)
    return exists
})


// Permissions

const permissions = shield({
    Query: {
        files: isAuthenticated,
        tags: isAuthenticated
    },
    Mutation: {
        articlesCreateOne: isAuthenticated,
        articlesDeleteOne: or(isModerator, isAdmin, and(isOwnerOfArticle, isGuest)),
        articlesUpdateOne: or(isModerator, isAdmin, and(isOwnerOfArticle, isGuest)),
        deleteArticlesOnIds: or(isModerator, isAdmin, and(isOwnerOfArticle, isGuest)),

        deleteContent: or(isModerator, isAdmin, and(isOwnerOfArticle, isGuest)),
        moveContent: or(isModerator, isAdmin, and(isOwnerOfArticle, isGuest)),
        updateContent: or(isModerator, isAdmin, and(isOwnerOfArticle, isGuest)),
        createContent: or(isModerator, isAdmin, and(isOwnerOfArticle, isGuest)),
        createFileReferences: or(isModerator, isAdmin, and(isOwnerOfArticle, isGuest)),

        filesCreateOne: isAuthenticated,
        filesUpdateOne: or(isModerator, isAdmin, and(isOwnerOfFile, isGuest)),
        filesDeleteOne: or(isModerator, isAdmin, and(isOwnerOfFile, isGuest)),

        tagsCreateOne: isAuthenticated,
        tagsUpdateOne: or(isModerator, isAdmin, and(isOwnerOfTag, isGuest)),
        tagsDeleteOne: or(isModerator, isAdmin, and(isOwnerOfTag, isGuest)),

        pageTemplatesCreateOne: or(isModerator, isAdmin),
        pageTemplatesDeleteOne: or(isModerator, isAdmin),
        pageTemplatesUpdateOne: or(isModerator, isAdmin)
    }
    // Fruit: isAuthenticated,
    // Customer: isAdmin
})

module.exports = {permissions}

