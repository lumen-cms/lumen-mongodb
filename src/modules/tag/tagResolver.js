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
        // findTags: async (parent, {where}, {db, rootAuthMutation}) => {
        //     try {
        //         // todo build in some filter and extend based on args
        //         const find = Object.assign({}, where, rootAuthMutation)
        //         const data = await db.collection(CollectionNames.tags)
        //             .find(find)
        //             .toArray()
        //         return data
        //     } catch (e) {
        //         console.error(e)
        //         throw new Error(e)
        //     }
        // }
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
        // createTag: async (parent, {data}, {db, projectId, user}) => {
        //     return insertOneMutation(db, CollectionNames.tags, data, {projectId, user})
        // },
        /**
         *
         * @param parent
         * @param data
         * @param {Db} db
         * @param projectId
         * @param user
         * @return {Promise<Promise<*>|*>}
         */
        // deleteTag: async (parent, {where: {id}}, {db, rootAuthMutation}) => {
        //     // todo prevent if used somewhere?
        //     return deleteOneMutation(db, CollectionNames.tags, {id}, rootAuthMutation)
        // },
        /**
         *
         * @param parent
         * @param id
         * @param data
         * @param db
         * @param rootAuthMutation
         * @return {Promise<Promise<{insertedId: string, acknowledged: boolean}>|*>}
         */
        // updateTag: async (parent, {where: {id}, data}, {db, rootAuthMutation}) => {
        //     // todo update in all connected collections
        //     return updateOneMutation(db, CollectionNames.tags, Object.assign({}, {id}, rootAuthMutation), data)
        // }
    }
}