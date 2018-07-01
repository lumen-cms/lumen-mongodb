// create a new post
const {CollectionNames} = require('../../../mongo/enum')
const {getUserObj} = require('../utils/userHelpers')
const {withFilter} = require('graphql-yoga')

const MutationTypes = {
    created: 'CREATED',
    updated: 'UPDATED',
    deleted: 'DELETED'
}

const MutationTriggers = {
    user: 'user' // must/should match subscription name
}

/**
 *
 * @param mutationType
 * @param node
 * @param trigger
 * @param {PubSub} pubSub
 * @param {Collection} collection
 */
async function publishChange ({mutationType, node, trigger}, pubSub, collection) {
    if (!mutationType || !node || !trigger || !pubSub || !collection) {
        throw new Error('One or more required fields not set on publishChange function')
    }

    const object = await collection.findOne({_id: node._id})
    object._id = object._id.toString() // get _id string
    pubSub.publish(MutationTriggers[trigger], {
        // first field musst match subscription name
        [MutationTriggers[trigger]]: {
            mutationType,
            node: object
        }
    })
}

module.exports = {
    Query: {
        /**
         *
         * @param parent
         * @param args
         * @param {Db} db
         * @returns {Promise<*>}
         */
        users: async (parent, args, {db}) => {
            try {
                const users = await db.collection(CollectionNames.users).find()
                return users.toArray()
            } catch (e) {
                console.log(e)
                throw new Error('Cannot fetch User!!!')
            }
        }
    },
    Mutation: {
        /**
         *
         * @param parent
         * @param _id
         * @param email
         * @param firstName
         * @param lastName
         * @param {Db} db
         * @param {ObjectID} ObjectID
         * @param {PubSub} pubSub
         * @returns {Promise<void>}
         */
        updateUser: async (parent, {_id, email, firstName, lastName}, {db, ObjectID, pubSub}) => {
            const form = getUserObj({email, firstName, lastName})
            try {
                delete form._id // need to remove the _id modifier
                const res = await db.collection(CollectionNames.users).updateOne(
                    {_id: ObjectID(_id)},
                    {$set: form}
                )
                if (res.matchedCount !== 1) {
                    throw new Error('error.user_not_found')
                }
                await publishChange({
                        mutationType: MutationTypes.updated,
                        trigger: MutationTriggers.user,
                        node: {_id: ObjectID(_id)}
                    },
                    pubSub,
                    collections.users
                )
                return res
            } catch (e) {
                console.log(e)
                throw new Error(e.message)
            }

        },
        /**
         *
         * @param parent
         * @param email
         * @param firstName
         * @param lastName
         * @param {Db} db
         * @param {PubSub} pubSub
         * @returns {Promise<void>}
         */
        createUser: async (parent, {email, firstName, lastName}, {db, pubSub}) => {
            const form = getUserObj({email, firstName, lastName})
            const collection = db.collection(CollectionNames.users)
            // save the post
            try {
                const res = await collection.insertOne(
                    form
                )
                await publishChange({
                        mutationType: MutationTypes.created,
                        trigger: MutationTriggers.user,
                        node: {_id: res.insertedId}
                    },
                    pubSub,
                    collection)
                return res
            } catch (e) {
                console.log(e)
                throw new Error(e)
            }
        },
        /**
         *
         * @param parent
         * @param id
         * @param username
         * @param {Db} db
         * @returns {Promise<void>}
         */
        deleteUser: async (parent, {data:{id, username}}, {db}) => {
            const collection = db.collection(CollectionNames.users)
            const find = {}
            id && (find.id = id)
            username && (find.username = username)
            try {
                const r = await collection.deleteOne(find)
                return r
            } catch (e) {
                console.log(e)
                throw new Error('delete_user_error')
            }
        }
    },
    Subscription: {
        user: {
            // can define resolver in case its needed to change output
            subscribe: withFilter(
                (parent, args, {pubSub}) => pubSub.asyncIterator(MutationTriggers.user),
                ({user: {mutationType}}, args) => {
                    // some more complex logic for auth and granular subscriptions
                    const filterMutationType = args && args.where && args.where.mutation_in
                    if (Array.isArray(filterMutationType)) {
                        return filterMutationType.includes(mutationType)
                    }
                    // default: don't trigger change if not properly set with vars (for testing purpose)
                    return false
                }
            )
        }
    }
}
