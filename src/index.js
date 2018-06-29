const {resolve} = require('path')
process.env.NODE_ENV = process.env.NODE_ENV || 'development'
const {GraphQLServer, PubSub, withFilter} = require('graphql-yoga')
require('dotenv').config()
const {startDB} = require('./mongo/initDb')
const resolvers = require('./graphql/resolvers')
const {getProjectId, getUserFromToken} = require('./util/contextHelper')

async function startServer () {

    /**
     *
     * @type {{db: Db, ObjectID: ObjectID}|*}
     */
    const initDb = await startDB({})
    /**
     *
     * @type {PubSub}
     */
    const pubSub = new PubSub()

    /**
     *
     * @param req
     * @returns {{req: *, db: Db, ObjectID: ObjectID, pubSub: PubSub, withFilter: (asyncIteratorFn: ResolverFn, filterFn: FilterFn) => ResolverFn}}
     */
    const context = (req) => ({
        req: req.request,
        db: initDb.db,
        ObjectID: initDb.ObjectID,
        pubSub,
        withFilter,
        projectId: getProjectId(req.request),
        user: getUserFromToken(req.request)
    })

    /**
     *
     * @type {GraphQLServer}
     */
    const Server = new GraphQLServer({
        typeDefs: resolve(__dirname, './graphql/schema.graphql'),
        resolvers,
        context
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

