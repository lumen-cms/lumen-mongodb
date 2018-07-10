const {insertOneMutation, deleteOneMutation, updateOneMutation} = require('../../../mongo/mutations/updateOneMutations')
const {CollectionNames} = require('../../../mongo/enum')
module.exports = {
    Query: {
        /**
         *
         * @param parent
         * @param where
         * @param {Db} db
         * @param rootAuthQuery
         * @return {Promise<*>}
         */
        findFiles: async (parent, {where}, {db, rootAuthQuery}) => {
            try {
                // todo build in some filter and extend based on args
                const find = Object.assign({}, where, rootAuthQuery)
                const data = await db.collection(CollectionNames.files)
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
        createFile: async (parent, {data}, {db, projectId, user}) => {
            return insertOneMutation(db.collection(CollectionNames.files), data, {projectId, user})
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
        deleteFile: async (parent, {where: {id}}, {db, rootAuthMutation}) => {
            // todo 1: prevent delete if used in other collections
            // todo 2: remove file from s3 storage

            return deleteOneMutation(db.collection(CollectionNames.files), {id}, rootAuthMutation)
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
        updateFile: async (parent, {where: {id}, data}, {db, rootAuthMutation}) => {
            const collection = db.collection(CollectionNames.files)
            return updateOneMutation(collection, Object.assign({}, {id}, rootAuthMutation), data)
        }
    }
}