const {UserRole} = require('../src/mongo/enum')
const {GraphQLClient} = require('graphql-request')

const staticToken = {
    moderator: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWIzODdmNjY1MmE1YjcxZWMyZmZlOTIxIiwiZW1haWwiOiJkamdhcm1zK21vZGVyYXRvckBnbWFpbC5jb20iLCJmaXJzdE5hbWUiOiJNb2RlcmF0b3IiLCJsYXN0TmFtZSI6IlVzZXIiLCJwZXJtaXNzaW9ucyI6W3sicHJvamVjdElkIjoidGVzdCIsInJvbGUiOiJNT0RFUkFUT1IifV19LCJpYXQiOjE1MzA0MjkyODZ9._eXvtjqJWPGUtt86ApFI5x6NfPK1e6HPhcqkMIV2E2A'
}

const TestUser = {
    id: '12341234',
    email: 'djgarms+test@gmail.com',
    firstName: 'AVA Test FirstName',
    lastName: 'AVA Test LastName',
    permissions: [{
        projectId: 'test',
        role: UserRole.MODERATOR
    }]
}

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

function graphqlRequest (gql, variables, token) {
    return getGqlClient(token).request(gql, variables)
}

module.exports = {
    graphqlRequest,
    staticToken,
    TestUser
}
