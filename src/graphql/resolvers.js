const user = require('../modules/user/resolvers/user')
const auth = require('../modules/user/resolvers/auth')

module.exports = {
    Query: Object.assign(user.Query, auth.Query),
    Mutation: Object.assign(user.Mutation, auth.Mutation),
    Subscription: Object.assign(user.Subscription)
}
