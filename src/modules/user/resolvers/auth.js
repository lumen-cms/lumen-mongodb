const {CollectionNames, UserRole} = require('../../../mongo/enum')
const bcrypt = require('bcryptjs')
const {sign} = require('jsonwebtoken')
const insertOneMutation = require('../../../mongo/mutations/insertOneMutation').insertOneMutation
const {getUserObj} = require('../utils/userHelpers')

/**
 * @description generates a user token based on userId and app secret
 * @param user
 * @returns {*}
 */
const signTokenForUser = user => sign({user}, process.env.APP_SECRET)

module.exports = {
    Query: {
        /**
         *
         * @param parent
         * @param ctx
         * @param {Db} db
         * @param {Request} req
         * @param {ObjectID} ObjectID
         * @returns {Promise<void>}
         */
        me: async (parent, ctx, {db, req, user}) => {
            const id = user && user.id
            if (!id) return null
            return db.collection(CollectionNames.users).findOne({id: id})
        }
    },
    Mutation: {
        /**
         *
         * @param parent
         * @param email
         * @param firstName
         * @param lastName
         * @param password
         * @param {Db} db
         * @param {ObjectID} ObjectID
         * @returns {Promise<{token: *, user: *}>}
         */
        signup: async (parent, {email, firstName, lastName, password}, {db, projectId}) => {
            const hashed = await bcrypt.hash(password, 10)
            const form = getUserObj({email, firstName, lastName})
            const permissions = [{
                projectId,
                role: UserRole.MODERATOR
            }]

            Object.assign(form, {
                services: {
                    password: {
                        bcrypt: hashed
                    }
                },
                permissions
            })
            // save the post
            try {
                const collection = db.collection(CollectionNames.users)
                const {insertedId} = await insertOneMutation(collection, form)
                const user = await collection.findOne({id: insertedId})
                const token = signTokenForUser({
                    id: insertedId,
                    email,
                    firstName,
                    lastName,
                    permissions
                })
                // todo write token into user object as lastloggedin
                return {
                    token: token,
                    user: Object.assign(user, {_id: user._id.valueOf()})
                }
            } catch (e) {
                console.error(e)
                throw new Error(e)
            }
        },
        /**
         *
         * @param parent
         * @param email
         * @param password
         * @param {Db} db
         * @returns {Promise<{token: *, user: *}>}
         */
        login: async (parent, {email, password}, {db}) => {
            const user = await db.collection(CollectionNames.users).findOne({
                username: email
            })
            if (!user) {
                throw new Error(`No user found for email: ${email}`)
            }
            try {
                const valid = await bcrypt.compare(
                    password,
                    user.services.password.bcrypt
                )
                if (!valid) {
                    throw new Error('Invalid password')
                }
                return {
                    token: signTokenForUser({
                        id: user._id,
                        firstName: user.profile.firstName,
                        lastName: user.profile.lastName,
                        permissions: user.permissions
                    }),
                    user: Object.assign(user, {_id: user._id.valueOf()})
                }
            } catch (e) {
                throw new Error(e)
            }
        }
    }
}
