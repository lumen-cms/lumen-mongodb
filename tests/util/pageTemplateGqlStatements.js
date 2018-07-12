/* eslint-disable node/no-unpublished-require */
const gql = require('graphql-tag')

const createPageTemplateGql = gql`mutation ($data:PageTemplateInput!){
    pageTemplatesCreateOne(data:$data){
        acknowledged
        insertedId
    }
}`

const updatePageTemplateGql = gql`mutation ($data:PageTemplateInput!,$where:ModifyPageTemplateInput!){
    pageTemplatesUpdateOne(data:$data,where:$where){
        acknowledged
        matchedCount
        modifiedCount
        upsertedId
    }
}`


const deletePageTemplateGql = gql`mutation ($where:ModifyPageTemplateInput!){
    pageTemplatesDeleteOne(where:$where){
        acknowledged
        deletedCount
    }
}`


const findPageTemplatesGql = gql`query ($where:FindPageTemplatesInput!){
    pageTemplates(where:$where){
        body
        bodyJson
        key
        languageKey
        title
        type
    }
}`

module.exports = {findPageTemplatesGql, deletePageTemplateGql, updatePageTemplateGql, createPageTemplateGql}