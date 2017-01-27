'use strict'
const Request = require('./events/request')
const Response = require('./events/response')
/**
 * @type {Request}
 */
module.exports.Request = Request
/**
 * @type {Response}
 */
module.exports.Response = Response

/**
 * @type {Request}
 */
module.exports.request = function (opts) {
  return new Request(opts)
}
/**
 * @type {Response}
 */
module.exports.response = function (opts) {
  return new Response(opts)
}
