const deleteArticleGql = `
mutation($where:DeleteArticleInput){
  deleteArticle(where:$where){
    acknowledged 
    deletedCount
  }
}`

const deleteManyArticlesGql = `
mutation($where:DeleteManyArticleInput){
  deleteArticlesOnIds(where:$where){acknowledged deletedCount}
}`

const updateArticleGql = `
mutation ($data: ArticleInput, $where:ArticleWhereInput) {
  updateArticle(data: $data, where:$where) {
    acknowledged
    matchedCount
    modifiedCount
    upsertedId
  }
}`

const createArticleGql = `
mutation ($data: ArticleInput) {
  createArticle(data: $data) {
    insertedId
    acknowledged
  }
}`

const articleGql = `
query article($where:ArticleWhereInput){
  article(where:$where){
    id
    projectId
    slug
    title
    createdBy
    contentElements{
     id
     type
     description
     materializedPath
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
       }
     }
    }
  }
}`


const findArticlesGql = `
query{
    findArticles{
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