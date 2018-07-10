const {insertOneMutation, deleteOneMutation, updateOneMutation} = require('../../mongo/mutations/updateOneMutations')
const {CollectionNames} = require('../../mongo/enum')

module.exports = {
    Query: {
        /**
         *
         * @param parent
         * @param where
         * @param {Db} db
         * @param rootAuthQuery
         * @return {Promise<void>}
         */
        findPageTemplates: async (parent, {where}, {db, rootAuthMutation}) => {
            try {
                // todo build in some filter and extend based on args
                const find = Object.assign({}, where, rootAuthMutation)
                const data = await db.collection(CollectionNames.pageTemplates)
                    .find(find)
                    .toArray()
                return data
            } catch (e) {
                console.error(e)
                throw new Error(e)
            }
        }
    },
    Mutation: {
        /**
         *
         * @param parent
         * @param data
         * @param db
         * @param projectId
         * @param user
         * @return {Promise<Promise<{insertedId: string, acknowledged: boolean}>|*>}
         */
        createPageTemplate: async (parent, {data}, {db, projectId, user}) => {
            return insertOneMutation(db, CollectionNames.pageTemplates, data, {projectId, user})
        },
        /**
         *
         * @param parent
         * @param data
         * @param {Db} db
         * @param projectId
         * @param user
         * @return {Promise<Promise<*>|*>}
         */
        deletePageTemplate: async (parent, {where: {id}}, {db, rootAuthMutation}) => {
            // todo prevent if used somewhere?
            return deleteOneMutation(db, CollectionNames.pageTemplates, {id}, rootAuthMutation)
        },
        /**
         *
         * @param parent
         * @param id
         * @param data
         * @param db
         * @param rootAuthMutation
         * @return {Promise<Promise<{insertedId: string, acknowledged: boolean}>|*>}
         */
        updatePageTemplate: async (parent, {where: {id}, data}, {db, rootAuthMutation}) => {
            // todo update in all connected collections
            return updateOneMutation(db, CollectionNames.pageTemplates, Object.assign({}, {id}, rootAuthMutation), data)
        }
    }
}