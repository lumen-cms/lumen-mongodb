/* eslint-disable node/no-unpublished-require */
const gql = require('graphql-tag')

const deleteContentGql = gql`
    mutation ($where:ContentModifyInput!){
        deleteContent(where:$where){
            updated
        }
    }`

const moveContentGql = gql`
    mutation ($where:ContentMoveInput!, $isCopy:Boolean, $position: Int!){
        moveContent(where:$where, isCopy:$isCopy, position:$position){
            acknowledged
            matchedCount
            modifiedCount
            upsertedId
        }
    }`

const createContentGql = gql`
    mutation ($where:ContentCreateInput!, $data:ContentInput!){
        createContent(where:$where, data:$data){
            updated
        }
    }`

const updateContentGql = gql`
    mutation ($where:ContentModifyInput!, $data:ContentInput!){
        updateContent(where:$where, data:$data){
            updated
        }
    }`

const createFileReferencesGql = gql`
    mutation($where:ContentModifyInput!, $data:[FileReferenceInput!]!, $isBackground:Boolean){
        createFileReferences(where:$where, data:$data, isBackground:$isBackground){
            updated
        }
    }`

// const updateFileReferenceGql = `
// mutation($where:ContentModifyFileReference!, $data:[FileReferenceInput!]!, $isBackground:Boolean){
//   updateFileReference(where:$where, data:$data, isBackground:$isBackground){
//         updated
//   }
// }`

module.exports = {
    deleteContentGql,
    moveContentGql,
    createContentGql,
    updateContentGql,
    createFileReferencesGql
    // ,
    // updateFileReferenceGql
}