const {MongoClient} = require('mongodb')
const {initUserCollection} = require('../modules/user/db/userCollection.js')
const {initArticleCollection} = require('../modules/article/db/articleCollection')
const {initFileCollection} = require('../modules/file/fileCollection')
const {initTagCollection} = require('../modules/tag/tagCollection')
const {initAuthorCollection} = require('../modules/authors/authorsCollection')
const DB = {
  user: process.env[process.env.NODE_ENV + '_MONGODB_USER'],
  password: process.env[process.env.NODE_ENV + '_MONGODB_PASSWORD'],
  db: process.env[process.env.NODE_ENV + '_MONGODB_DB'],
  url: process.env[process.env.NODE_ENV + '_MONGODB_URL']
}

/**
 *
 * @param database
 * @return {*}
 */
function cleanup (database) {
  return database.close(true)
}

module.exports = {
  /**
   *
   * @param user
   * @param password
   * @param url
   * @param db
   * @return {Promise<Db>}
   */
  connectMongoDb: async ({user = DB.user, password = DB.password, url = DB.url, db = DB.db}) => {
    try {
      /**
       *
       * @type {MongoClient}
       */
      const client = await MongoClient.connect(`mongodb://${user}:${password}@${url}/${db}`, {useNewUrlParser: true})
      /**
       *
       * @type {Db}
       */
      const database = client.db(db)

      // every collection needs to be initialized (for indexes and validation)
      await initUserCollection(database)
      await initArticleCollection(database)
      await initFileCollection(database)
      await initTagCollection(database)
      await initAuthorCollection(database)
      // process.on('SIGINT', cleanup(client))
      // process.on('SIGTERM', cleanup(client))
      return {database, client}
    } catch (e) {
      console.log(e)
      throw new Error(e)
    }
  }
}
