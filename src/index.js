process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const {GraphQLServer, PubSub, withFilter} = require('graphql-yoga')
require('dotenv').config()
const {connectMongoDb} = require('./mongo/initDb')
const {getAuthBaseMutation, getAuthBaseQuery} = require('./util/queryAuthHelper')
const {permissions} = require('./graphql/middleware/permissions')
const {getProjectId, getUserRoleOnProjectID} = require('./util/contextHelper')
const {MongoWhereDirective, MongoFindDirective, MongoCreateOneDirective, MongoUpdateOneDirective, MongoDeleteOneDirective} = require('./graphql/directives/MongoGenericDirectives')
const typeDefs = require('./graphql/mergeTypeDefs')
const resolvers = require('./graphql/mergeResolvers')

async function startServer () {
  /**
   *
   * @type {{db: Db, ObjectID: ObjectID}|*}
   */
  const {database,client} = await connectMongoDb({})

  /**
   *
   * @type {PubSub}
   */
  const pubSub = new PubSub()

  /**
   *
   * @param req
   * @returns {Promise<{req: *, db: (Db.database|*), pubSub: PubSub, withFilter: (asyncIteratorFn: ResolverFn, filterFn: FilterFn) => ResolverFn, projectId: (*|*|boolean|string), user: *, permission: *, rootAuthMutation: (*|{projectId: *}), rootAuthQuery: (*|{projectId: *})}>}
   */
  const context = async (req) => {
    /**
     *
     */
    const projectId = getProjectId(req.request)

    client.db(projectId)
    
    const {user, permission} = getUserRoleOnProjectID(req.request, projectId)

    return {
      req: req.request,
      db: database,
      pubSub,
      withFilter,
      projectId,
      user,
      permission,
      rootAuthMutation: getAuthBaseMutation(projectId, user, permission),
      rootAuthQuery: getAuthBaseQuery(projectId, user, permission)
    }
  }

  /**
   *
   * @type {GraphQLServer}
   */
  const Server = new GraphQLServer({
    typeDefs,
    resolvers,
    context,
    middlewares: [permissions],
    schemaDirectives: {
      MongoWhere: MongoWhereDirective,
      MongoFind: MongoFindDirective,
      MongoCreateOne: MongoCreateOneDirective,
      MongoUpdateOne: MongoUpdateOneDirective,
      MongoDeleteOne: MongoDeleteOneDirective
    }
    // resolverValidationOptions: {
    //     allowResolversNotInSchema: true
    // }
  })

  // options
  const opts = {
    cors: {
      credentials: true,
      origin: ['http://localhost:8080', 'http://localhost:3000'] // here define the origins
    },
    port: 4000
  }

  return Server.start(opts, () => {
    console.log(`Server is running on http://localhost:${opts.port}`)
  })
}

return startServer()

