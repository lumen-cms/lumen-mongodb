const {CollectionNames} = require('../../../mongo/enum')

const validation = {
    $jsonSchema: {
        bsonType: 'object',
        required: ['username'],
        properties: {
            username: {
                bsonType: 'string',
                description:'string and is not required'
            },
            profile: {
                bsonType: 'object',
                required: ['firstName'],
                properties: {
                    firstName: {
                        bsonType: 'string',
                        description:'string and is not required'
                    },
                    lastName: {
                        bsonType: 'string',
                        description:'string and is not required'
                    },
                    name: {
                        bsonType: 'string',
                        description:'string and is not required'
                    }
                }
            },
            services: {
                bsonType: 'array',
                items: {
                    bsonType: 'object',
                    properties: {
                        google: {
                            bsonType: 'object',
                            description:'object and is not required'
                        },
                        password: {
                            bsonType: 'object',
                            properties: {
                                bcrypt: {
                                    bsonType: 'string',
                                    description:'string and is not required'
                                }
                            }
                        },
                        facebook: {
                            bsonType: 'object',
                            description:'object and is not required'
                        },
                        resume: {
                            bsonType: 'object',
                            description:'object and is not required'
                        }
                    }
                }
            },
            emails: {
                bsonType: 'array',
                properties: {
                    address: {
                        bsonType: 'string',
                        description:'string and is not required'
                    },
                    verified: {
                        bsonType: 'bool',
                        description:'bool and is not required'
                    },
                    dropped: {
                        bsonType: 'object',
                        description:'object and is not required'
                    }
                }
            },
            permissions: {
                bsonType: 'array',
                items: {
                    bsonType: 'object',
                    properties: {
                        projectId: {
                            bsonType: 'string',
                            description:'string and is not required'
                        },
                        role: {
                            bsonType: 'string',
                            description:'string and is not required'

                        }
                    }
                }
            }
        }
    }
}

/**
 *
 * @param {Db} db
 * @returns {Promise|*}
 */
async function initUserCollection (db) {
    try {
        await db.createCollection(CollectionNames.users, {})
        const col = db.collection(CollectionNames.users)
        await col.createIndex({'emails.address': 1}, {unique: true})
        await col.createIndex({'username': 1}, {unique: true})
        await col.createIndex({id: 1}, {unique: true})
    } catch (e) {
        console.log(e)
        throw new Error(e)
    }
}


module.exports = {initUserCollection}
