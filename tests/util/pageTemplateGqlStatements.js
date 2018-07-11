/* eslint-disable node/no-unpublished-require */
const gql = require('graphql-tag')

const createPageTemplateGql = gql`mutation ($data:PageTemplateInput!){
    createPageTemplate(data:$data){
        acknowledged
        insertedId
    }
}`

const updatePageTemplateGql = gql`mutation ($data:PageTemplateInput!,$where:ModifyPageTemplateInput!){
    updatePageTemplate(data:$data,where:$where){
        acknowledged
        matchedCount
        modifiedCount
        upsertedId
    }
}`


const deletePageTemplateGql = gql`mutation ($where:ModifyPageTemplateInput!){
    deletePageTemplate(where:$where){
        acknowledged
        deletedCount
    }
}`


const findPageTemplatesGql = gql`query ($where:FindPageTemplateInput!){
    findPageTemplates(where:$where){
        body
        bodyJson
        key
        languageKey
        title
        type
    }
}`

module.exports = {findPageTemplatesGql, deletePageTemplateGql, updatePageTemplateGql, createPageTemplateGql}