/* eslint-disable node/no-unpublished-require */
const gql = require('graphql-tag')

const createFileGql = gql`
    mutation ($data:FileInput!){
        createFile(data:$data){
            insertedId
            acknowledged
        }
    }`

const updateFileGql = gql`
    mutation ($where:FileMutateInput!,$data:FileInput!){
        updateFile(data:$data, where:$where){
            acknowledged
            matchedCount
            modifiedCount
            upsertedId
        }
    }`

const deleteFileGql = gql`
    mutation($where:FileMutateInput!){
        deleteFile(where:$where){
            acknowledged deletedCount
        }
    }`

const findFilesGql = gql`
    query($where:FileFindInput){
        findFiles(where:$where){
            url
            id
            width
            height
            size
            contentType
            name
            key
        }
    }`

module.exports = {findFilesGql, deleteFileGql, updateFileGql, createFileGql}