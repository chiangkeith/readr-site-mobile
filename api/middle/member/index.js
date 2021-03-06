const { constructScope, fetchPermissions, } = require('../../services/perm')
const { find, get, } = require('lodash')
const { handlerError, } = require('../../comm')
const config = require('../../config')
const debug = require('debug')('READR:api:member')
const express = require('express')
const router = express.Router()
const superagent = require('superagent')

const MongoClient = require('mongodb').MongoClient
const mongourl = config.TALK_DB

const apiHost = config.API_PROTOCOL + '://' + config.API_HOST + ':' + config.API_PORT

const checkoutUserPerms = (role, email) => new Promise((resolve) => {
  fetchPermissions().then((perms) => {
    const scopes = constructScope(perms, role)
    const isModerator = find(scopes, (s) => (s === 'manageComment'))
    const talkRole = role !== config.ROLE_MAP.ADMIN
                        ? isModerator
                        ? 'MODERATOR'
                        : 'COMMENTER'
                        : 'ADMIN'
    debug('About to update user to be', talkRole)
    updateUserRoleForTalk(talkRole, email).then(() => {
      resolve()
    })
  })
})

const updateUserRoleForTalk = (role, email) => new Promise((resolve) => {
  MongoClient.connect(mongourl, function(err, client) {
    debug("Connected successfully to server")
    const db = client.db('talk')
    const collection = db.collection('users')
    collection.updateOne({ "profiles.id": { $in: [ email, ], }, }
      , { $set: { role : role, }, }, function() {
      debug('Updating ', email, '\'s role to', role, 'to talk')
      client.close()
      resolve()
    })
  })
})

const updateUserNameForTalk = (email, username) => new Promise((resolve) => {
  MongoClient.connect(mongourl, function(err, client) {
    debug("Connected successfully to server")
    const db = client.db('talk')
    const collection = db.collection('users')
    collection.updateOne({ "profiles.id": { $in: [ email, ], }, }
      , { $set: { username: username, lowercaseUsername: username.toLowerCase(), }, }, function() {
      debug('Updating ', email, '\'s username to', username, 'to talk')
      client.close()
      resolve()
    })
  })
})

const banUserForTalk = (email) => new Promise((resolve) => {
  MongoClient.connect(mongourl, function(err, client) {
    debug("Connected successfully to server")
    const db = client.db('talk')
    const collection = db.collection('users')
    collection.updateOne({ "profiles.id": { $in: [ email, ], }, }
      , { $set: { status: { banned: { status: true, },},},}, function() {
      debug('Ban ', email)
      client.close()
      resolve()
    })
  })
})

const syncAvatar = (email, url) => new Promise((resolve) => {
  MongoClient.connect(mongourl, function(err, client) {
    debug("Connected successfully to server")
    const db = client.db('talk')
    const collection = db.collection('users')
    collection.updateOne({ "profiles.id": { $in: [ email, ], }, }
      , { $set: { metadata: { avatar: url, }, }, }, function() {
      client.close()
      resolve()
    })
  })
})

router.put('/role', (req, res) => {
  debug('Got a req to update user\'s role')
  debug(req.body)
  const url = `${apiHost}/member`
  superagent
  .put(url)
  .send(req.body)
  .end((err, response) => {
    if (!err && response) {
      debug('Update user\'s role sucessfully')
      checkoutUserPerms(req.body.role, req.body.mail).then(() => res.status(200).end())
    } else {
      res.status(500).json(err)
    }
  })
})

router.put('/', (req, res, next) => {
  req.body.nickname && updateUserNameForTalk(req.user.email, req.body.nickname)
  next()
})

router.post('/syncavatar', (req, res) => {
  debug('Got a avatar sync req.')
  debug(req.body)
  const email = get(req.body, 'id', '')
  const url = get(req.body, 'url', null)
  syncAvatar(email, url)
  .then(() => {
    res.status(200).send('Sync avatar successfully.')
  })
  .catch((err) => {
    const err_wrapper = handlerError(err, {})
    res.status(err_wrapper.status).send(err_wrapper.text)
    console.error(`Error occurred  during snyc avatar : ${req.url}`)
    console.error(err)
  })
})

router.post('*', () => {})

router.delete('*', (req, res, next) => {
  debug('going to del member')
  debug(req.body)
  debug(req.url)
  const userid = req.url.split('/')[ 1 ]
  userid && banUserForTalk(userid).then(() => {
    next()
  })
})

module.exports = router
