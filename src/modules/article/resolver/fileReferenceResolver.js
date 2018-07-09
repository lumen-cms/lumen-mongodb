const {getMaterializedMongoModifier, createObjectIdString} = require('../../../util/addObjectIdsToArray')
const {CollectionNames} = require('../../../mongo/enum')
const {documentExistsOnce} = require('../../../mongo/mutations/documentExists')

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
            if (Array.isArray(data)) {
                data = data.map(i => (Object.assign(i, {id: createObjectIdString()})))
            } else {
                data = [Object.assign({}, data, {id: createObjectIdString()})]
            }

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
            return {updated: !!res.value}


        }
    }
}