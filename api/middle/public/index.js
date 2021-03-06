const { fetchFromRedis, redisFetching, redisWriting, insertIntoRedis, } = require('../redisHandler')
const { mapKeys, pick, } = require('lodash')
const { API_PROTOCOL, API_HOST, API_PORT, API_TIMEOUT, POST_ACTIVE, POST_TYPE, } = require('../../config')
const debug = require('debug')('READR:api:public')
const express = require('express')
const router = express.Router()
const superagent = require('superagent')
const publicQueryValidation = require('./validate')
const schema = require('./schema')

const apiHost = API_PROTOCOL + '://' + API_HOST + ':' + API_PORT

const fetchAndConstructMembers = (req, res) => {
  const url = `${apiHost}${req.url}`
  redisFetching(`member${req.url}`, ({ err, data, }) => {
    if (!err && data) {
      debug('Fetch public member data from Redis.')
      debug('>>>', req.url)
      const mem = JSON.parse(data)
      res.json({
        'items': mem['_items'].map((object) => pick(object, [ 'id', 'nickname', 'description', 'profile_image', ])),
      })
    } else {
      superagent
      .get(url)
      .end((e, response) => {
        debug('Fetch public member data from api.', url)
        if (!e && response) {
          redisWriting(`member${req.url}`, response.text)
          const mem = JSON.parse(response.text)
          res.json({
            'items': mem['_items'].map((object) => pick(object, [ 'id', 'nickname', 'description', 'profile_image', ])),
          })
        } else {
          res.status(response.status).send('{\'error\':' + e + '}')
          console.error(`error during fetch data from: member${req.url}`)
          console.error(e)  
        }
      })
    }
  })  
}

router.get('/profile/:id', (req, res, next) => {
  const id = req.params.id
  debug('Going to get member profile.', id)
  if (!id) { res.status(403).send(`Forbidden.`) }
  req.url = `/member/${id}`
  next()
}, fetchAndConstructMembers)

router.get('/members', publicQueryValidation.validate(schema.members), fetchAndConstructMembers)

router.get('/posts', publicQueryValidation.validate(schema.posts), (req, res, next) => {
  const activePostQueryString = `{"$in":[${POST_ACTIVE.ACTIVE}]}`
  if (Object.keys(req.query).length === 0) {
    req.url += `?active=${activePostQueryString}&type={"$in":[${POST_TYPE.REVIEW}, ${POST_TYPE.NEWS}]}`
  } else {
    req.url += `&active=${activePostQueryString}&type={"$in":[${POST_TYPE.REVIEW}, ${POST_TYPE.NEWS}]}`
  }
  next()
},
fetchFromRedis,
function (req, res, next) {
  const url = `${apiHost}${req.url}`
  if (res.redis) {
    console.log('fetch data from Redis.', req.url)
    const resData = JSON.parse(res.redis)
    res.json(resData)
  } else {
    superagent
      .get(url)
      .timeout(API_TIMEOUT)
      .end((e, r) => {
        if (!e && r) {
          const dt = JSON.parse(r.text)
          if (dt['_items'] !== null && dt.constructor === Object) {
            res.dataString = r.text
            /**
             * if data not empty, go next to save data to redis
             */
            next()
          }
          const resData = JSON.parse(r.text)
          res.json(resData)
        } else {
          res.json(e)
          console.error(`error during fetch public data from : ${url}`)
          console.error(e)  
        }
      })
    }
}, insertIntoRedis)

router.get('/projects', publicQueryValidation.validate(schema.projects), (req, res, next) => {
  let url = '/project/list?'
  mapKeys(req.query, (value, key) => {
    url = `${url}&${key}=${value}`
  })
  req.url = url
  next()
}, fetchFromRedis, (req, res, next) => {
  const url = `${apiHost}${req.url}`
  if (res.redis) {
    console.log('fetch data from Redis.', req.url)
    const resData = JSON.parse(res.redis)
    res.json(resData)
  } else {
    superagent
      .get(url)
      .timeout(API_TIMEOUT)
      .end((e, r) => {
        if (!e && r) {
          const dt = JSON.parse(r.text)
          if (dt['_items'] !== null && dt.constructor === Object) {
            res.dataString = r.text
            /**
             * if data not empty, go next to save data to redis
             */
            next()
          }
          const resData = JSON.parse(r.text)
          res.json(resData)
        } else {
          res.json(e)
          console.error(`error during fetch public data from : ${url}`)
          console.error(e)  
        }
      })
  }
}, insertIntoRedis)

router.get('/videos', publicQueryValidation.validate(schema.videos), (req, res, next) => {
  let url = `/posts?active={"$in":[${POST_ACTIVE.ACTIVE}]}&type={"$in":[${POST_TYPE.VIDEO}, ${POST_TYPE.LIVE}]}`
  mapKeys(req.query, (value, key) => {
    url = `${url}&${key}=${value}`
  })
  req.url = url
  next()
}, fetchFromRedis, (req, res, next) => {
  const url = `${apiHost}${req.url}`
  if (res.redis) {
    console.log('fetch data from Redis.', req.url)
    const resData = JSON.parse(res.redis)
    res.json(resData)
  } else {
    superagent
      .get(url)
      .timeout(API_TIMEOUT)
      .end((e, r) => {
        if (!e && r) {
          const dt = JSON.parse(r.text)
          if (dt['_items'] !== null && dt.constructor === Object) {
            res.dataString = r.text
            /**
             * if data not empty, go next to save data to redis
             */
            next()
          }
          const resData = JSON.parse(r.text)
          res.json(resData)
        } else {
          res.json(e)
          console.error(`error during fetch public data from : ${url}`)
          console.error(e)  
        }
      })
  }
}, insertIntoRedis)

router.get('/videos/count', (req, res, next) => {
  const url = `/posts/count?active={"$in":[${POST_ACTIVE.ACTIVE}]}&type={"$in":[${POST_TYPE.VIDEO}, ${POST_TYPE.LIVE}]}`
  req.url = url
  next()
}, fetchFromRedis, (req, res, next) => {
  const url = `${apiHost}${req.url}`
  if (res.redis) {
    console.log('fetch data from Redis.', req.url)
    const resData = JSON.parse(res.redis)
    res.json(resData)
  } else {
    superagent
      .get(url)
      .timeout(API_TIMEOUT)
      .end((e, r) => {
        if (!e && r) {
          const dt = JSON.parse(r.text)
          if (dt['_items'] !== null && dt.constructor === Object) {
            res.dataString = r.text
            /**
             * if data not empty, go next to save data to redis
             */
            next()
          }
          const resData = JSON.parse(r.text)
          res.json(resData)
        } else {
          res.json(e)
          console.error(`error during fetch public data from : ${url}`)
          console.error(e)  
        }
      })
  }
}, insertIntoRedis)

module.exports = router
