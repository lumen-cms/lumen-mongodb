const {updateOneMutation} = require('../../../mongo/mutations/updateOneMutation')
const {insertOneMutation} = require('../../../mongo/mutations/insertOneMutation')
const {CollectionNames} = require('../../../mongo/enum')


module.exports = {
    Query: {
        /**
         *
         * @param parent
         * @param {string} slug
         * @param {string} id
         * @param {Db} db
         * @param req
         * @return {Promise<void>}
         */
        article: async (parent, {where: {slug, id}}, {db}) => {
            const find = {}
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
         * @param ObjectID
         * @returns {Promise<void>}
         */
        findArticles: async (parent, ctx, {db, req}) => {
            try {
                const data = await db.collection(CollectionNames.articles)
                    .find()
                    .toArray()
                console.log(data)
                return data
            } catch (e) {
                console.error(e)
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
         * @param {ObjectID} ObjectID
         * @returns {Promise<void>}
         */
        createArticle: async (parent, {data}, {db, projectId, user}) => {
            return insertOneMutation(db.collection(CollectionNames.articles), data, {projectId, user})
        },
        /**
         *
         * @param parent
         * @param id
         * @param {Db} db
         * @return {Promise<void>}
         */
        deleteArticle: async (parent, {where: {id}}, {db}) => {
            try {
                const r = await db.collection(CollectionNames.articles).deleteOne({id})
                return r
            } catch (e) {
                console.log(e)
                throw new Error('delete_article')
            }
        },
        updateArticle: async (parent, {where, data}, {db}) => {
            const collection = db.collection(CollectionNames.articles)
            try {
                const r = await updateOneMutation(collection, where, data)
                return r
            } catch (e) {
                throw new Error('update_article')
            }
        }
    }
}