const createFileGql = `
mutation ($data:FileInput!){
  createFile(data:$data){
    insertedId
    acknowledged
  }
}
`

const updateFileGql = `
mutation ($where:FileMutateInput!,$data:FileInput!){
    updateFile(data:$data, where:$where){
        acknowledged
        matchedCount
        modifiedCount
        upsertedId
    }
}`

const deleteFileGql = `
mutation($where:FileMutateInput!){
  deleteFile(where:$where){
    acknowledged deletedCount
  }
}`

const findFilesGql = `
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