const {CollectionNames, UserRole} = require('../../../mongo/enum')
const bcrypt = require('bcryptjs')
const {sign} = require('jsonwebtoken')
const {insertOneMutation} = require('../../../mongo/mutations/insertOneMutation')
const {getUserObj} = require('../utils/userHelpers')

/**
 * @description generates a user token based on userId and app secret
 * @param user
 * @returns {*}
 */
const signTokenForUser = (user) => {
    const s = process.env.APP_SECRET
    return sign({user}, s)
}

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
        me: async (parent, ctx, {db, user}) => {
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
        signup: async (parent, {data: {email, firstName, lastName, password}}, {db, projectId}) => {
            const collection = db.collection(CollectionNames.users)
            const existingUser = await collection.findOne({username: email})
            if (existingUser) {
                throw new Error('signup_user_exist')
            }
            const hashed = await bcrypt.hash(password, 10)
            const form = getUserObj({email, firstName, lastName})
            const permissions = [{
                projectId,
                role: UserRole.MODERATOR
            }]
            Object.assign(form, {
                services: [{
                    password: {
                        bcrypt: hashed
                    }
                }],
                permissions
            })
            // save the post
            try {
                const {insertedId} = await insertOneMutation(collection, form)
                const userPayload = {
                    id: insertedId,
                    email,
                    firstName,
                    lastName,
                    permissions
                }
                const token = signTokenForUser(userPayload)
                // todo write token into user object as lastloggedin
                return {
                    token,
                    user: userPayload
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
        login: async (parent, {data: {email, password}}, {db}) => {
            const user = await db.collection(CollectionNames.users).findOne({
                username: email
            })
            if (!user) {
                throw new Error('login_user_not_found')
            }
            try {
                const emailPassword = user.services.find(i => !!i.password)
                if(!emailPassword){
                    throw new Error('login_password_not_found')
                }
                const valid = await bcrypt.compare(
                    password,
                    emailPassword.password.bcrypt
                )
                if (!valid) {
                    throw new Error('Invalid password')
                }
                const userPayload = {
                    id: user.id,
                    email,
                    firstName: user.profile.firstName,
                    lastName: user.profile.lastName,
                    permissions: user.permissions
                }
                return {
                    token: signTokenForUser(userPayload),
                    user: userPayload
                }
            } catch (e) {
                throw new Error(e)
            }
        }
    }
}
