const {verify, sign} = require('jsonwebtoken')

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
     * @param {Request} req
     * @return {AuthUser|null}
     */
    getUserFromToken: function (req) {
        try {
            const Authorization = req.get('Authorization')
            if (Authorization) {
                const token = Authorization.replace('Bearer ', '')
                /**
                 * @type AuthUser
                 */
                const {user} = verify(token, process.env.APP_SECRET)
                return user || null
            } else {
                return null
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