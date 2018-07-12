/* eslint-disable node/no-unpublished-require */
const gql = require('graphql-tag')

const createTagGql = gql`
    mutation ($data:TagInput!){
        tagsCreateOne(data:$data){
            insertedId
            acknowledged
        }
    }`


const updateTagGql = gql`
    mutation ($data:TagUpdateInput!, $where:ModifyTagInput!){
        tagsUpdateOne(data:$data,where:$where){
            acknowledged
            matchedCount
            modifiedCount
            upsertedId
        }
    }`

const deleteTagGql = gql`
    mutation ($where:ModifyTagInput!){
        tagsDeleteOne(where:$where){
            acknowledged
            deletedCount
        }
    }`

const findTagsGql = gql`
    query($where:FindTagsInput){
        tags(where:$where){
            id
            languageKey
            slug
            title
            type
            _meta{
                articles
                files
            }
        }
    }`

module.exports = {createTagGql, updateTagGql, deleteTagGql, findTagsGql}