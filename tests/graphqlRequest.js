const {GraphQLClient} = require('graphql-request')

const moderatorToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWIzODdmNjY1MmE1YjcxZWMyZmZlOTIxIiwiZW1haWwiOiJkamdhcm1zK21vZGVyYXRvckBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJNb2RlcmF0b3IiLCJsYXN0TmFtZSI6IlVzZXIiLCJwZXJtaXNzaW9ucyI6W3sicHJvamVjdElkIjoidGVzdCIsInJvbGUiOiJNT0RFUkFUT1IifV19LCJpYXQiOjE1MzA0MjkyODZ9._eXvtjqJWPGUtt86ApFI5x6NfPK1e6HPhcqkMIV2E2A'

function getGqlClient (token) {
    const headers = {
        projectId: 'test'
    }
    if (token) {
        headers.Authorization = `Bearer ${token}`
    }
    return new GraphQLClient('http://localhost:4000', {
        headers
    })
}

/**
 *
 * @param gql
 * @param variables
 * @param [isAuth]
 * @returns {Promise<any>}
 */
function queryGql (gql, variables, isAuth) {
    const reqClient = isAuth ? authClient : client
    try {
        return reqClient.request(gql, variables)
            .catch((e) => {
                console.error(e)
            })
    } catch (e) {
        console.log(e)
        throw new Error('query gql error')
    }
}

function graphqlRequest (gql, variables, token) {
    try {
        return getGqlClient(token).request(gql, variables)
            .catch((e) => {
                console.error(e)
            })
    } catch (e) {
        console.log(e)
        throw new Error('query gql error')
    }
}

module.exports = {
    gqlApi: client,
    authGqlApi: authClient,
    queryGql,
    graphqlRequest
}
