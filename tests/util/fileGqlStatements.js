/* eslint-disable node/no-unpublished-require */
const gql = require('graphql-tag')

const createFileGql = gql`
    mutation ($data:FileInput!){
        filesCreateOne(data:$data){
            insertedId
            acknowledged
        }
    }`

const updateFileGql = gql`
    mutation ($where:FileMutateInput!,$data:FileInput!){
        filesUpdateOne(data:$data, where:$where){
            acknowledged
            matchedCount
            modifiedCount
            upsertedId
        }
    }`

const deleteFileGql = gql`
    mutation($where:FileMutateInput!){
        filesDeleteOne(where:$where){
            acknowledged deletedCount
        }
    }`

const findFilesGql = gql`
    query($where:FindFilesInput){
        files(where:$where){
            url
            id
            width
            height
            size
            contentType
            name
            key
            _meta{
                articlesPreviewImages
            }
        }
    }`

module.exports = {findFilesGql, deleteFileGql, updateFileGql, createFileGql}