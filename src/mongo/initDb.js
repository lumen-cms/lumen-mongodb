const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongodb').ObjectID
const initUserCollection = require('../modules/user/db/collections/user.js')
const DB = {
    user: process.env[process.env.NODE_ENV + '_MONGODB_USER'],
    password: process.env[process.env.NODE_ENV + '_MONGODB_PASSWORD'],
    db: process.env[process.env.NODE_ENV + '_MONGODB_DB'],
    url: process.env[process.env.NODE_ENV + '_MONGODB_URL']
}
module.exports = {
    /**
     *
     * @param user
     * @param password
     * @param url
     * @param db
     * @returns {Promise<{db: Db, ObjectID: ObjectID}>}
     */
    startDB: async ({user = DB.user, password = DB.password, url = DB.url, db = DB.db}) => {
        try {
            /**
             *
             * @type {MongoClient}
             */
            const client = await MongoClient.connect(`mongodb://${user}:${password}@${url}/${db}`)

            /**
             *
             * @type {Db}
             */
            const database = client.db(db)

            await initUserCollection(database)

            return {
                db: database,
                ObjectID
            }

        } catch (e) {
            console.log(e)
        }
    }
}
