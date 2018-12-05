const {UserRole} = require('../mongo/enum')
const {verify, sign} = require('jsonwebtoken')

/**
 *
 * @param permissions
 * @return {*}
 */
function getPermissionOfUser (permissions) {
    if (permissions.includes(UserRole.OPERATOR)) {
        return UserRole.OPERATOR
    } else if (permissions.includes(UserRole.ADMIN)) {
        return UserRole.ADMIN
    } else if (permissions.includes(UserRole.MODERATOR)) {
        return UserRole.MODERATOR
    } else if (permissions.includes(UserRole.GUEST)) {
        return UserRole.GUEST
    }
    return null
}

/**
 *
 * @typedef {Object} AuthUser
 * @property {String} email
 * @property {String} firstName
 * @property {String} lastName
 * @property {Array} permissions
 * @property {string} permissions.projectId
 * @property {string} permissions.role
 */

module.exports = {
    /**
     *
     * @param {Request} req
     * @returns {*|boolean|string}
     */
    getProjectId: function (req) {
        const projectId = req.header('projectid') || (process.env.NODE_ENV === 'development' && process.env.PROJECT_ID)
        if (!projectId) {
            throw new Error('projectId|projectid must be set to run this server')
        }
        return projectId
    },
    /**
     *
     * @param req
     * @param projectId
     * @return {user:AuthUser,permissions.<string>}
     */
    getUserRoleOnProjectID: function (req, projectId) {
        try {
            const Authorization = req.get('Authorization')
            if (Authorization && Authorization !== 'null') {
                const token = Authorization.replace('Bearer ', '')
                /**
                 * @type AuthUser
                 */
                const {user} = verify(token, process.env.APP_SECRET)
                if (user) {
                    const permissions = user.permissions
                        .filter(p => p.projectId === projectId)
                        .map(p => p.role)
                    const permission = getPermissionOfUser(permissions)
                    return permission ? {user, permission} : {}
                }
                return {}
            } else {
                return {}
            }
        } catch (e) {
            console.log(e)
            throw new Error('error_token_not_valid')
        }
    },
    /**
     * @description generates a user token based on userId and app secret
     * @param user
     * @returns {*}
     */
    signTokenForUser: (user) => {
        const s = process.env.APP_SECRET
        return sign({user}, s)
    }
}
