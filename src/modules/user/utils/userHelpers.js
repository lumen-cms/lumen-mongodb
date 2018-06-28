module.exports = {
    /**
     *
     * @param email
     * @param firstName
     * @param lastName
     * @returns {{username: *, profile: {firstName: *, lastName: *}, emails: *[]}}
     */
    getUserObj: ({email, firstName, lastName}) => ({
        username: email,
        profile: {
            firstName,
            lastName
        },
        emails: [{address: email}]
    })
}