const {getMaterializedMongoModifier, createObjectIdString} = require('../../../util/addObjectIdsToArray')
const {CollectionNames} = require('../../../mongo/enum')
const {documentExistsOnce} = require('../../../mongo/mutations/documentExists')
module.exports = {
    Mutation: {

        /**
         *
         * @param parent
         * @param {string} articleId
         * @param {number} position
         * @param {string} materializedPath
         * @param {object} data
         * @param {Db} db
         * @param {object} rootAuthMutation
         * @return {Promise<void>}
         */
        createContent: async (parent, {where: {articleId, position, materializedPath}, data}, {db, rootAuthMutation}) => {

        },
        /**
         *
         * @param parent
         * @param slug
         * @param id
         * @param {Db} db
         * @param rootAuthMutation
         * @return {Promise<{updated:boolean}>}
         */
        deleteContent: async (parent, {where: {articleId, id, materializedPath}}, {db, rootAuthMutation}) => {
            const {queryPath, mutationPath} = getMaterializedMongoModifier(materializedPath)

            const find = Object.assign({
                id: articleId,
                [queryPath]: id
            }, rootAuthMutation)
            // check if exists
            const collection = db.collection(CollectionNames.articles)
            const res = await collection.findOneAndUpdate(
                find,
                {
                    $pull: {
                        [mutationPath]: {id}
                    }
                },
                {
                    projection: {
                        id: 1, _id: 0
                    }
                })

            return {updated: !!res.value}
        },
        /**
         *
         * @param parent
         * @param {{articleId:string,id:string,materializedPath:string}} from
         * @param {{articleId:string,id:string,materializedPath:string}} to
         * @param {object} data
         * @param {boolean} isCopy
         * @param {Db} db
         * @param rootAuthMutation
         * @return {Promise<void>}
         */
        moveContent: async (parent, {where: {from, to}, data, isCopy}, {db, rootAuthMutation}) => {
            const collection = db.collection(CollectionNames.articles)
            /**
             *
             * @type {{queryPath: string, mutationPath: string, lastIndex: number}|*}
             */
            const fromMaterialized = getMaterializedMongoModifier(from.materializedPath)
            /**
             *
             * @type {{queryPath: string, mutationPath: string, lastIndex: number}|*}
             */
            const toMaterialized = getMaterializedMongoModifier(to.materializedPath)

            const existsFrom = await documentExistsOnce(collection, Object.assign({
                id: from.articleId,
                [fromMaterialized.queryPath]: from.id
            }, rootAuthMutation))
            if (!existsFrom) {
                throw new Error('move-content-from-missing')
            }
            const existsTo = await documentExistsOnce(collection, Object.assign({
                id: to.articleId,
                [toMaterialized.queryPath]: to.id
            }, rootAuthMutation))
            if (!existsTo) {
                throw new Error('move-content-to-missing')
            }

            // remove old field in case of move.
            if (!isCopy) {
                await collection.updateOne(
                    {id: from.articleId},
                    {
                        $pull: {
                            [fromMaterialized.mutationPath]: {id: from.id}
                        }
                    })
            }
            // add new field to specific position
            // update materialized path of new location
            data.materializedPath = to.materializedPath.replace(/[0-9]+(?!.*[0-9])/, i => parseInt(i) + 1)
            isCopy && (data.id = createObjectIdString())
            // update collection
            const insertIntoStatement = {
                $push: {
                    [toMaterialized.mutationPath]: {
                        $each: [data],
                        $position: toMaterialized.lastIndex + 1
                    }
                }
            }
            const res = await collection.updateOne({id: to.articleId}, insertIntoStatement)
            return res
        }
    }
}