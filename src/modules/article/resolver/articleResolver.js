const {addObjectIdsToArray} = require('../../../util/addObjectIdsToArray')
const {insertOneMutation, deleteOneMutation, updateOneMutation} = require('../../../mongo/mutations/updateOneMutations')
const {CollectionNames} = require('../../../mongo/enum')

module.exports = {
    Query: {
        /**
         *
         * @param parent
         * @param {string} slug
         * @param {string} id
         * @param {Db} db
         * @param {} rootAuthQuery
         * @return {Promise<void>}
         */
        article: async (parent, {where: {slug, id}}, {db, rootAuthQuery}) => {
            const find = rootAuthQuery
            slug && (find.slug = slug)
            id && (find.id = id)
            const article = await db.collection(CollectionNames.articles).findOne(find)
            if (!article) {
                // todo need to check 301 collection for redirects for less hassle on client side
            }
            return article
        },
        /**
         *
         * @param parent
         * @param ctx
         * @param {Db} db
         * @param {Request} req
         * @param {} rootAuthQuery
         * @returns {Promise<void>}
         */
        findArticles: async (parent, ctx, {rootAuthQuery, db}) => {
            try {
                const find = rootAuthQuery
                // todo build in some filter and extend find
                const data = await db.collection(CollectionNames.articles)
                    .find(find)
                    .toArray()
                return data
            } catch (e) {
                console.error(e)
                throw new Error('find_articles')
            }
        }
    },
    Mutation: {
        /**
         *
         * @param parent
         * @param ctx
         * @param {Db} db
         * @param {Request} req
         * @returns {Promise<void>}
         */
        createArticle: async (parent, {data}, {db, projectId, user}) => {
            if (Array.isArray(data.contentElements)) {
                // add ObjectID to each content element
                data.contentElements = addObjectIdsToArray(data.contentElements, 'children')
            }

            return insertOneMutation(db, CollectionNames.articles, data, {projectId, user})
        },
        /**
         *
         * @param parent
         * @param id
         * @param {Db} db
         * @param {} rootAuthMutation
         * @return {Promise<void>}
         */
        deleteArticle: async (parent, {where: {id}}, {db, rootAuthMutation}) => {
            return deleteOneMutation(db, CollectionNames.articles, {id}, rootAuthMutation)
        },
        /**
         *
         * @param parent
         * @param id
         * @param {Db} db
         * @param {} rootAuthMutation
         * @return {Promise<void>}
         */
        deleteArticlesOnIds: async (parent, {where: {ids}}, {db, rootAuthMutation}) => {
            try {
                const find = rootAuthMutation
                find.id = {$in: ids}
                const collection = db.collection(CollectionNames.articles)
                const r = await collection.deleteMany(find)
                return r
            } catch (e) {
                console.log(e)
                throw new Error('delete_article')
            }
        },
        /**
         *
         * @param parent
         * @param where
         * @param data
         * @param db
         * @param rootAuthMutation
         * @return {Promise<{insertedId: string, acknowledged: boolean}|*>}
         */
        updateArticle: async (parent, {where, data}, {db, rootAuthMutation}) => {
            return updateOneMutation(db, CollectionNames.articles, Object.assign({}, where, rootAuthMutation), data)
        }
    }
}