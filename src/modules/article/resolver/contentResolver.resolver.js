const {getMaterializedMongoModifier, createObjectIdString} = require('../../../util/addObjectIdsToArray')
const {CollectionNames} = require('../../../mongo/enum')
const {documentExistsOnce} = require('../../../mongo/mutations/documentExists')
const _get = require('lodash.get')
module.exports = {
    Mutation: {
        /**
         *
         * @param parent
         * @param articleId
         * @param id
         * @param materializedPath
         * @param data
         * @param {Db} db
         * @param rootAuthMutation
         * @return {Promise<{updated: boolean}>}
         */
        updateContent: async (parent, {where: {articleId, id, materializedPath}, data}, {db, rootAuthMutation}) => {
            const {queryPath, mutationPath} = getMaterializedMongoModifier(materializedPath)
            const find = Object.assign({
                id: articleId,
                [queryPath]: id
            }, rootAuthMutation)
            // find and update content element
            const collection = db.collection(CollectionNames.articles)
            const res = await collection.findOneAndUpdate(find, {
                $set: {
                    [mutationPath + '.$']: data
                }
            }, {
                projection: {
                    id: 1, _id: 0
                }
            })

            // todo update background|fileReferences

            return {updated: !!res.value}
        },

        /**
         *
         * @param parent
         * @param {string} articleId
         * @param {number} position
         * @param {string} materializedPath
         * @param {object} data
         * @param {Db} db
         * @param {object} rootAuthMutation
         * @return {Promise<{updated:boolean}>}
         */
        createContent: async (parent, {where: {articleId, position, materializedPath}, data}, {db, rootAuthMutation}) => {
            const {mutationPath} = getMaterializedMongoModifier(materializedPath)
            const find = Object.assign({
                id: articleId
            }, rootAuthMutation)
            data.materializedPath = materializedPath // create materializedPath
            data.id = createObjectIdString() // create ObjectID
            const collection = db.collection(CollectionNames.articles)
            const res = await collection.findOneAndUpdate(find, {
                $push: {
                    [mutationPath]: {
                        $each: [data],
                        $position: position
                    }
                }
            }, {
                projection: {_id: false, id: 1}
            })
            return {updated: !!res.value}
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
            // find and update content element
            const collection = db.collection(CollectionNames.articles)
            const res = await collection.findOneAndUpdate(find, {
                $pull: {
                    [mutationPath]: {id}
                }
            }, {
                projection: {
                    id: 1, _id: 0
                }
            })

            // todo remove background|fileReferences

            return {updated: !!res.value}
        },
        /**
         *
         * @param parent
         * @param {{articleId:string,id:string,materializedPath:string}} from
         * @param {{articleId:string,id:string,materializedPath:string}} to
         * @param {boolean} isCopy
         * @param {number} position
         * @param {Db} db
         * @param rootAuthMutation
         * @return {Promise<void>}
         */
        moveContent: async (parent, {where: {from, to}, isCopy, position}, {db, rootAuthMutation}) => {
            const collection = db.collection(CollectionNames.articles)
            /**
             *
             * @type {{queryPath: string, mutationPath: string, getPath: string}|*}
             */
            const fromMaterialized = getMaterializedMongoModifier(from.materializedPath)
            /**
             *
             * @type {{queryPath: string, mutationPath: string, getPath: string}|*}
             */
            const toMaterialized = getMaterializedMongoModifier(to.materializedPath)

            const existsFrom = await collection.findOne(
                Object.assign({
                        id: from.articleId,
                        [fromMaterialized.queryPath]: from.id
                    },
                    rootAuthMutation
                ), {
                    projection: {
                        id: 1, 'contentElements': 1
                    }
                })
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

            // fetch data from nested content
            /**
             *
             * @type {array}
             */
            const lastContent = _get(existsFrom, fromMaterialized.getPath)
            if (!Array.isArray(lastContent)) {
                throw new Error('content-move-element-not-found')
            }
            const data = lastContent.find(i => i.id === from.id)

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
            data.materializedPath = to.materializedPath //.replace(/[0-9]+(?!.*[0-9])/, i => parseInt(i) + 1)
            data.id = createObjectIdString()
            // update collection
            const insertIntoStatement = {
                $push: {
                    [toMaterialized.mutationPath]: {
                        $each: [data],
                        $position: position
                    }
                }
            }
            const res = await collection.updateOne({id: to.articleId}, insertIntoStatement)
            return res
        }
    }
}