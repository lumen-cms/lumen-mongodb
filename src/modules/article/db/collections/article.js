const {CollectionNames} = require('../../../../mongo/enum')

module.exports = function (db) {
    try {
        db.createCollection(CollectionNames.articles, {})
        // const col = db.collection(CollectionNames.articles)
    } catch (e) {
        console.log(e)
        throw new Error(e)
    }
}