/* eslint-disable node/no-unpublished-require */
const gql = require('graphql-tag')

const createTagGql = gql`
    mutation ($data:TagInput!){
        createTag(data:$data){
            insertedId
            acknowledged
        }
    }`


const updateTagGql = gql`
    mutation ($data:TagInput!, $where:ModifyTagInput!){
        updateTag(data:$data,where:$where){
            acknowledged
            matchedCount
            modifiedCount
            upsertedId
        }
    }`

const deleteTagGql = gql`
    mutation ($where:ModifyTagInput!){
        deleteTag(where:$where){
            acknowledged
            deletedCount
        }
    }`

const findTagsGql = gql`
    query($where:FindTagsInput){
        findTags(where:$where){
            languageKey
            slug
            title
            type
            usedOnArticles
            usedOnFiles
        }
    }`

module.exports = {createTagGql, updateTagGql, deleteTagGql, findTagsGql}