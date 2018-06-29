const {verify} = require('jsonwebtoken')
module.exports = {
    /**
     *
     * @param {Request} req
     * @returns {*|boolean|string}
     */
    getProjectId: function (req) {
        const projectId = req.header('projectid') || (process.env.NODE_ENV === 'development' && process.env.PROJECT_ID)
        if (!projectId) {
            throw new Error('projectId must be set to run this server')
        }
        return projectId
    },
    /**
     *
     * @param {Request} req
     */
    getUserFromToken: function (req) {
        try {
            const Authorization = req.get('Authorization')
            if (Authorization) {
                const token = Authorization.replace('Bearer ', '')
                const {user} = verify(token, process.env.APP_SECRET)
                return user || null
            } else {
                return null
            }
        } catch (e) {
            console.log(e)
            throw new Error('error_token_not_valid')
        }
        throw new Error('error_token_not_valid')
    }
}