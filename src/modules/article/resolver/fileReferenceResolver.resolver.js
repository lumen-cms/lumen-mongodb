const {getMaterializedMongoModifier, createObjectIdString} = require('../../../util/addObjectIdsToArray')
const {CollectionNames} = require('../../../mongo/enum')

module.exports = {
    Mutation: {
        /**
         *
         * @param parent
         * @param articleId
         * @param id
         * @param materializedPath
         * @param {object} data
         * @param {boolean} isBackground
         * @param {Db} db
         * @param rootAuthMutation
         * @return {Promise<{updated: boolean}>}
         */
        createFileReferences: async (parent, {where: {articleId, id, materializedPath}, data, isBackground}, {db, rootAuthMutation}) => {
            // update content element as fileReferences or backgroundFileReferences
            const {queryPath, mutationPath} = getMaterializedMongoModifier(materializedPath)
            const find = Object.assign({
                id: articleId,
                [queryPath]: id
            }, rootAuthMutation)
            // prepare data
            if (!Array.isArray(data)) {
                throw new Error('no-array-given')
            }
            data = data.map(i => (Object.assign(i, {id: createObjectIdString()})))

            const collection = db.collection(CollectionNames.articles)
            const col = isBackground ? 'backgroundFileReferences' : 'fileReferences'
            const pathToMutate = `${mutationPath}.$.${col}`
            const res = await collection.findOneAndUpdate(find, {
                $addToSet: {
                    [pathToMutate]: {
                        $each: data
                    }
                }
            }, {
                projection: {
                    id: 1, _id: 0
                }
            })
            // todo update references to File to indicate the use of files + write a test
            return {updated: !!res.value}
        }
    }
}