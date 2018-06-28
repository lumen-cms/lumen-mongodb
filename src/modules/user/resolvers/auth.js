const {CollectionNames} = require('../../../mongo/enum')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {getUserObj} = require('../utils/userHelpers')
const APP_SECRET = 'super-secret-app-key-pt'
const oID = require('mongodb').ObjectID
/**
 * @description generates a user token based on userId and app secret
 * @param userId
 * @returns {*}
 */
const generateToken = userId =>
    jwt.sign({userId}, process.env.APP_SECRET || APP_SECRET)

/**
 * @description returns userId from generated token
 * @param ctx
 * @returns {*}
 */
const getUserIdFromContext = req => {
    const Authorization = req.get('Authorization')
    if (Authorization) {
        const token = Authorization.replace('Bearer ', '')
        const {userId} = jwt.verify(token, APP_SECRET)
        return userId
    }

    throw new Error('error_token_not_valid')
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
        me: async (parent, ctx, {db, req, ObjectID}) => {
            const _id = getUserIdFromContext(req)
            const oIDOfUser = oID(_id)
            const user = await db.collection(CollectionNames.users).findOne({_id: ObjectID(_id)})
            Object.assign(user, {
                _id: user._id.valueOf()
            })
            return user
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
        signup: async (parent, {email, firstName, lastName, password}, {db, ObjectID}) => {
            const hashed = await bcrypt.hash(password, 10)
            const form = getUserObj({email, firstName, lastName})
            Object.assign(form, {
                services: {
                    password: {
                        bcrypt: hashed
                    }
                }
            })
            // save the post
            try {
                const collection = db.collection(CollectionNames.users)
                const res = await collection.insertOne(
                    form
                )
                const user = await collection.findOne({_id: ObjectID(res.insertedId)})
                return {
                    token: generateToken(res.insertedId),
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
                    token: generateToken(user._id),
                    user: Object.assign(user, {_id: user._id.valueOf()})
                }
            } catch (e) {
                throw new Error(e)
            }
        }
    }
}
