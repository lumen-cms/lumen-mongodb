const fixtureArticle = {
    title: 'Test Title',
    slug: 'test/123',
    languageKey: 'de',
    description: 'This is a very long description',
    metaTitle: 'Meta Title',
    deleted: false,
    published: false,
    contentElements: [{
        type: 'TextImage',
        description: 'First'
    }, {
        type: 'Layout',
        description: 'Second',
        children: [{
            type: 'wrap',
            children: [{
                type: 'TextImage',
                description: 'Nested-First'
            }, {
                type: 'TextImage',
                description: 'Nested-Second'
            }, {
                type: 'TextImage',
                description: 'Nested-Third'
            }]
        }, {
            type: 'wrap',
            children: [
                {
                    type: 'TextImage',
                    description: 'Second-Nested-First'
                }
            ]
        }]
    }, {
        type: 'TextImage',
        description: 'Third'
    }]
}

module.exports = fixtureArticle