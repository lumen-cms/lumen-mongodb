const {CollectionNames} = require('../../../../mongo/enum')

const validation = {
    $jsonSchema: {
        bsonType: 'object',
        additionalProperties: false,
        required: ['username'],
        properties: {
            _id: {
                bsonType: 'objectId'
            },
            username: {
                bsonType: 'string'
            },
            profile: {
                bsonType: 'object',
                additionalProperties: false,
                required: ['firstName'],
                properties: {
                    _id: {
                        bsonType: 'objectId'
                    },
                    firstName: {
                        bsonType: 'string'
                    },
                    lastName: {
                        bsonType: 'string'
                    },
                    name: {
                        bsonType: 'string'
                    }
                }
            },
            services: {
                bsonType: 'array',
                additionalProperties: false,
                properties: {
                    google: {
                        bsonType: 'object'
                    },
                    password: {
                        bsonType: 'object',
                        additionalProperties: false,
                        properties: {
                            bcrypt: {
                                bsonType: 'string'
                            }
                        }
                    },
                    facebook: {
                        bsonType: 'object'
                    },
                    resume: {
                        bsonType: 'object'
                    }
                }
            },
            emails: {
                bsonType: 'array',
                additionalProperties: false,
                properties: {
                    address: {
                        type: 'string',
                        pattern: '^$|^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$',
                        description: 'validation.unique_email'
                    },
                    verified: {
                        bsonType: 'bool'
                    },
                    dropped: {
                        bsonType: 'object'
                    }
                }
            }
        }
    }
}
/**
 *
 * @param db
 * @returns {Promise|*}
 */
module.exports = function (db) {
    try {
        db.createCollection(CollectionNames.users, {validator: validation})
        const col = db.collection(CollectionNames.users)
        col.createIndex({'emails.address': 1}, {unique: true})
        col.createIndex({'username': 1}, {unique: true})
    } catch (e) {
        console.log(e)
        throw new Error(e)
    }
}
