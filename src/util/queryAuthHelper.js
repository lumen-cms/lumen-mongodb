const {UserRole} = require('../mongo/enum')
module.exports = {
    /**
     *
     * @param projectId
     * @param user
     * @param permission
     * @return {{projectId: *}}
     */
    getAuthBaseQuery: (projectId, user, permission) => {
        const find = {
            projectId
        }
        if (permission === UserRole.GUEST) {
            find.$or = [{
                createdBy: user.id,
                published: true
            }]
        } else if (!permission) {
            find.published = true
        }
        return find
    },
    /**
     *
     * @param projectId
     * @param user
     * @param permission
     * @return {{projectId: *}}
     */
    getAuthBaseMutation: (projectId, user, permission) => {
        const find = {
            projectId
        }
        if (permission === UserRole.GUEST) {
            find.createdBy = user.id
        }
        return find
    }
}