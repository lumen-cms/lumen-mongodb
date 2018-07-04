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

module.exports = {deleteContentGql, moveContentGql}