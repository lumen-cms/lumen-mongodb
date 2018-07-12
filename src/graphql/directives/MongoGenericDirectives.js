const {SchemaDirectiveVisitor} = require('graphql-tools')
const rename = require('deep-rename-keys')
const {CollectionNames} = require('../../mongo/enum')
const {insertOneMutation, deleteOneMutation, updateOneMutation} = require('../../mongo/mutations/updateOneMutations')

const mapper = {
    EQ: '$eq',
    GT: '$gt',
    GTE: '$gte',
    IN: '$in',
    LT: '$lt',
    LTE: '$lte',
    NEQ: '$neq',
    NIN: '$nin',
    AND: '$and',
    OR: '$or',
    NOR: '$nor'
}

const mapMongoArgs = (args) => {
    return rename(args, (key) => (mapper[key]) ? mapper[key] : key)
}


/**
 * @description converts args keys to mongo compatible call
 */
class MongoWhereDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition (field) {
        const resolverFunction = field.resolve
        if (typeof resolverFunction !== 'function') {
            throw new Error('resolver function must be a function')
        }
        field.resolve = async (...args) => {
            const mappedArgs = mapMongoArgs(args[1])
            return resolverFunction(args[0], mappedArgs, args[2], args[3])
        }
    }
}

class MongoFindDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition (field) {
        /**
         *
         * @param parent
         * @param where
         * @param db
         * @param rootAuthMutation
         * @param info
         * @return {*}
         */
        field.resolve = async (parent, {where}, {db, rootAuthMutation}, info) => {
            const col = CollectionNames[info.fieldName]
            if (!col) {
                throw new Error('current call is not recognized as collection')
            }
            const mappedWhere = mapMongoArgs(where)
            const query = Object.assign({}, mappedWhere, rootAuthMutation)
            return await db.collection(col).find(query).toArray()
        }
    }
}

class MongoCreateOneDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition (field) {
        /**
         *
         * @param parent
         * @param where
         * @param {Db} db
         * @param rootAuthMutation
         * @param info
         * @return {Promise<*>}
         */
        field.resolve = async (parent, {data}, {db, projectId, user}, info) => {
            const col = CollectionNames[info.fieldName.replace('CreateOne', '')]
            if (!col) {
                throw new Error('current call is not recognized as collection')
            }
            return await insertOneMutation(db, col, data, {projectId, user})
        }
    }
}

class MongoUpdateOneDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition (field) {
        /**
         *
         * @param parent
         * @param where
         * @param {Db} db
         * @param rootAuthMutation
         * @param info
         * @return {Promise<*>}
         */
        field.resolve = async (parent, {where: {id}, data}, {db, rootAuthMutation}, info) => {
            const col = CollectionNames[info.fieldName.replace('UpdateOne', '')]
            if (!col) {
                throw new Error('current call is not recognized as collection')
            }
            return await updateOneMutation(db, col, Object.assign({}, {id}, rootAuthMutation), data)
        }
    }
}

class MongoDeleteOneDirective extends SchemaDirectiveVisitor {
    visitFieldDefinition (field) {
        /**
         *
         * @param parent
         * @param where
         * @param {Db} db
         * @param rootAuthMutation
         * @param info
         * @return {Promise<*>}
         */
        field.resolve = async (parent, {where: {id}}, {db, rootAuthMutation}, info) => {
            const col = CollectionNames[info.fieldName.replace('DeleteOne', '')]
            if (!col) {
                throw new Error('current call is not recognized as collection')
            }
            return await deleteOneMutation(db, col, {id}, rootAuthMutation)
        }
    }
}


module.exports = {
    MongoWhereDirective,
    MongoFindDirective,
    MongoCreateOneDirective,
    MongoUpdateOneDirective,
    MongoDeleteOneDirective
}