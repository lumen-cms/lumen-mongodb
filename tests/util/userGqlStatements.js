const gql = require('graphql-tag')
const signupGql = gql`
    mutation signup($data:SignupInput) {
        signup(data:$data){
            token
            user {
                id
                firstName
                lastName
                email
                permissions{
                    projectId role
                }
            }
        }
    }`

const meGql = gql`
    query me {me{id username profile{firstName lastName}}}
`

const loginGql = gql`
    mutation login($data:LoginInput){
        login(data:$data){
            token
            user {
                id
                firstName
                lastName
                email
                permissions{
                    projectId role
                }
            }
        }
    }`

const deleteGql = gql`
    mutation deleteUser($where:DeleteUserInput){
        deleteUser(where:$where){acknowledged deletedCount}
    }`


module.exports = {deleteGql, loginGql, meGql, signupGql}