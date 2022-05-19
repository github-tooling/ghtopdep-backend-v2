'use strict';

const { NotFound } = require('http-errors');
const Redis = require('ioredis');
require('dotenv').config();

const ONE_MONTH = 60 * 60 * 24 * 30;

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
});

module.exports = async function (fastify, opts) {
  fastify.post('/', async function (request, reply) {
    const redisKey = `${request.body.owner}:${request.body.repository}`;
    await redis.set(redisKey, JSON.stringify(request.body.deps), 'EX', ONE_MONTH);
    return 'OK';
  });

  fastify.get('/', async function (request, reply) {
    return redis.keys('*');
  });

  fastify.get('/:owner/:repository', async function (request, reply) {
    if (request.params.owner && request.params.repository) {
      const redisKey = `${request.params.owner}:${request.params.repository}`;
      const result = await redis.get(redisKey);
      if (result) {
        return result;
      }
    }
    throw new NotFound();
  });
};
