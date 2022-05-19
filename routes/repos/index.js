'use strict'

const { NotFound } = require('http-errors');
const Redis = require("ioredis");
require('dotenv').config()

const ONE_MONTH = 60*60*24*30;

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});


module.exports = async function (fastify, opts) {
  fastify.post('/', async function (request, reply) {
    console.log(request.body)
    const redisKey = `${request.body.owner}:${request.body.repository}`
    await redis.set(redisKey, JSON.stringify(request.body.deps), "EX", ONE_MONTH)
    return "OK";
  });

  fastify.get('/', async function (request, reply) {
    console.log(request.query);
    if (request.query.owner &&  request.query.repository) {
      console.log(request.query.url);
      const redisKey = `${request.query.owner}:${request.query.repository}`
      const result = await redis.get(redisKey);
      console.log('result');
      console.log(result);
      if (result) {
        return result
      }
    }
    throw new NotFound();
  });
};
