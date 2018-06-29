const insertOneMutation = require('../../../mongo/mutations/insertOneMutation').insertOneMutation
const {CollectionNames} = require('../../../mongo/enum')


module.exports = {
    Query: {
        articleByPath: async (parent, ctx, {db, req, ObjectID}) => {
            console.log(ctx)
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
        createArticle: async (parent, ctx, {db, req}) => {
            const data = ctx.data
            return await insertOneMutation(db.collection(CollectionNames.articles), data)
        }
    }
}