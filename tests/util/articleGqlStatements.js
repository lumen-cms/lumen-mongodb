/* eslint-disable node/no-unpublished-require */
const gql = require('graphql-tag')

const deleteArticleGql = gql`
    mutation($where:DeleteArticleInput){
        articlesDeleteOne(where:$where){
            acknowledged
            deletedCount
        }
    }`

const deleteManyArticlesGql = gql`
    mutation($where:DeleteManyArticleInput){
        deleteArticlesOnIds(where:$where){acknowledged deletedCount}
    }`

const updateArticleGql = gql`
    mutation ($data: ArticleInputUpdate, $where:ArticleWhereInput) {
        articlesUpdateOne(data: $data, where:$where) {
            acknowledged
            matchedCount
            modifiedCount
            upsertedId
        }
    }`

const createArticleGql = gql`
    mutation ($data: ArticleInput) {
        articlesCreateOne(data: $data) {
            insertedId
            acknowledged
        }
    }`

const articleGql = gql`
    query article($where:ArticleWhereInput){
        article(where:$where){
            id
            projectId
            slug
            title
            createdBy
            tags{
                id
                slug
                title
            }
            contentElements{
                id
                type
                description
                materializedPath
                fileReferences{
                    id
                    title
                    caption
                    file{
                        id
                        url
                        height
                        key
                        name
                        size
                        url
                        width
                        contentType
                    }
                }
                backgroundFileReferences{
                    id
                    title
                    caption
                    file{
                        id
                        url
                        height
                        key
                        name
                        size
                        url
                        width
                        contentType
                    }
                }
                children{
                    id
                    type
                    materializedPath
                    description
                    children{
                        id
                        type
                        description
                        materializedPath
                        fileReferences{
                            id
                            title
                            caption
                            file{
                                id
                                url
                                height
                                key
                                name
                                size
                                url
                                width
                                contentType
                            }
                        }
                        backgroundFileReferences{
                            id
                            title
                            caption
                            file{
                                id
                                url
                                height
                                key
                                name
                                size
                                url
                                width
                                contentType
                            }
                        }
                    }
                }
            }
        }
    }`


const findArticlesGql = gql`
    query{
        articles{
            id
            slug
            title
            deleted
            languageKey
            published
        }
    }`

module.exports = {
    deleteArticleGql,
    deleteManyArticlesGql,
    updateArticleGql,
    createArticleGql,
    articleGql,
    findArticlesGql
}