import test from 'ava'
import {graphqlRequest} from '../../util/graphqlRequest'
import {deleteGql, loginGql, meGql, signupGql} from '../../util/userGqlStatements'

const signupData = {
    'firstName': 'Dominic',
    'lastName': 'Garms',
    'email': 'djgarms+test@gmail.com',
    'password': 'test123'
}

const deleteData = {
    username: 'djgarms+test@gmail.com'
}

test.serial('test authentication roundtrips for user register and login', async t => {
    const {signup} = await graphqlRequest(signupGql, {data: signupData})
    const token = signup.token
    const {me} = await graphqlRequest(meGql, null, token)
    const {login} = await graphqlRequest(loginGql, {
        data: {
            email: signupData.email,
            password: signupData.password
        }
    })
    const {deleteUser} = await graphqlRequest(deleteGql, {where: deleteData})
    t.is(!!login, true)
    t.is(!!signup.token, true)
    t.is(me.username, signupData.email)
    t.is(me.profile.firstName, signupData.firstName)
    t.is(me.profile.lastName, signupData.lastName)
    t.is(!!signup.user, true)
    t.is(signup.user.firstName, signupData.firstName)
    t.is(login.user.firstName, signupData.firstName)
    t.is(signup.user.lastName, signupData.lastName)
    t.is(login.user.lastName, signupData.lastName)
    t.is(signup.user.email, signupData.email)
    t.is(login.user.email, signupData.email)
    t.is(Array.isArray(signup.user.permissions), true)
    t.is(deleteUser.deletedCount, 1)
})
