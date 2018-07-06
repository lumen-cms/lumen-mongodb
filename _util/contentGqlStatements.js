const deleteContentGql = `
mutation ($where:DeleteContentInput!){
  deleteContent(where:$where){
   updated
  }
}`

const moveContentGql = `
mutation ($where:ContentMoveInput!, $isCopy:Boolean, $position: Int!){
  moveContent(where:$where, isCopy:$isCopy, position:$position){
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