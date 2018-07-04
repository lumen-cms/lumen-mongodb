const deleteContentGql = `
mutation ($where:DeleteContentInput!){
  deleteContent(where:$where){
   updated
  }
}`

const moveContentGql = `
mutation ($where:ContentMoveInput!, $data:ContentInput!,$isCopy:Boolean){
  moveContent(where:$where, data:$data, isCopy:$isCopy){
    acknowledged
    matchedCount
    modifiedCount
    upsertedId
  }
}`

const createContentGql = `
mutation ($where:ContentCreateInput!, $data:ContentInput!){
  createContent(where:$where, data:$data){
    updated
  }
}`


module.exports = {deleteContentGql, moveContentGql, createContentGql}