'use strict'
const _get = require('lodash.get')
const _transform = require('lodash.transform')
const _has = require('lodash.has')
const typeis = require('type-is').is
const urlParse = require('url-parse')
const _toString = require('lodash.tostring')
const cookie = require('cookie')
const accepts = require('accepts')

/**
 * Turns a lambda proxy event into an express.js-like
 * request object.
 *
 * A lot was borrowed from here https://expressjs.com/en/api.html#req (Thanks!)
 *
 * @module lambda-proxy-utils
 * @class Request
 */
class Request {
  /**
   * @param {object} rawLambdaEvent -- The event passed to the lambda function
   * with lambda-proxy type integration
   */
  constructor (rawLambdaEvent) {
    /**
     * JSON body or null
     * @TODO Support all content types for body
     * @type {null|{}}
     */
    this.body = Request.parseBody(rawLambdaEvent)

    /**
     * Parsed and normalized headers
     * @type {{}}
     */
    this.headers = Request.parseHeaders(rawLambdaEvent)

    /**
     * Parsed cookies or empty object
     * @type {{}}
     */
    this.cookies = Request.parseCookies(this.headers.cookie)

    /**
     * sourceIp
     * @type {string}
     */
    this.ip = _get(rawLambdaEvent, 'requestContext.identity.sourceIp', '')

    /**
     * This property is an object containing properties mapped to the named route “parameters”. For example,
     * if you have the route /user/:name, then the “name” property is available as req.params.name.
     * This object defaults to {}.
     * @type {{}}
     */
    this.params = _get(rawLambdaEvent, 'pathParameters', {})

    /**
     * Passed query string parameters. Defaults to {}.
     * @type {{}}
     */
    this.query = _get(rawLambdaEvent, 'queryStringParameters', {})

    /**
     * Contains the path part of the request URL.
     * @type {string}
     */
    this.path = _get(rawLambdaEvent, 'path', '')

    /**
     * A Boolean property that is true if the request’s X-Requested-With header field is “XMLHttpRequest”,
     * indicating that the request was issued by a client library such as jQuery.
     * @type {boolean}
     */
    this.xhr = false

    /**
     * Contains a string corresponding to the HTTP method of the request: GET, POST, PUT, and so on.
     * @type {string}
     */
    this.method = _get(rawLambdaEvent, 'httpMethod', 'GET').toUpperCase()

    /**
     * Parsed referring including parsed query
     * @type {Url}
     */
    this.referrer = urlParse(_toString(this.headers.referrer), true)

    /**
     * User agent passed from API Gateway
     * @type {string}
     */
    this.userAgent = _get(rawLambdaEvent, 'requestContext.identity.userAgent', '')

    /**
     * Raw API Gateway event
     * @type {object}
     */
    this.rawLambdaEvent = rawLambdaEvent
  }

  /**
   * Returns the field from the requestContext object from AWS API Gateway
   *
   * Returns undefined if nothing is found.
   * The Referrer and Referer fields are interchangeable.
   * @param {string} propertyPath
   * @returns {string|object}
   */
  context (propertyPath) {
    return _get(this.rawLambdaEvent, `requestContext.${propertyPath}`)
  }

  /**
   * Returns the field from one of the objects in this order:
   *  - query parameters
   *  - cookies
   *  - header
   *
   * Returns undefined if nothing is found.
   * The Referrer and Referer fields are interchangeable.
   * @param {string} field
   */
  get (field) {
    const val = this.query[field] || this.cookies[field]
    if (typeof val !== 'undefined') {
      return val
    }
    return this.headers[field.toLowerCase()]
  }

  /**
   * Returns query param value filtered for 'null', 'false', true', etc
   *
   * Returns undefined if nothing is found.
   * @param {string} param
   */
  getQueryParam (param) {
    return Request.valueFilter(this.query[param])
  }

  /**
   * Returns the cookie value, case-insensitive
   *
   * Returns undefined if nothing is found.
   * @param {string} name
   */
  getCookie (name) {
    return this.cookies[name.toLowerCase()]
  }

  /**
   * Returns the header value, case-insensitive
   *
   * Returns undefined if nothing is found.
   * @param {string} field
   */
  getHeader (field) {
    return this.headers[field.toLowerCase()]
  }

  /**
   * Returns true if the incoming request’s “Content-Type” HTTP header field matches the MIME type
   * specified by the type parameter. Returns false otherwise.
   *
   * // With Content-Type: text/html; charset=utf-8
   * req.is('html');
   * req.is('text/html');
   * req.is('text/*');
   * // => true
   *
   * // When Content-Type is application/json
   * req.is('json');
   * req.is('application/json');
   * req.is('application/*');
   * // => true
   *
   * req.is('html');
   * // => false
   *
   * @param {string} type -- string or pattern
   * @returns {boolean}
   */
  is (type) {
    return !!typeis(this.headers['content-type'], type)
  }

  /**
   * Check if the given `type(s)` is acceptable, returning
   * the best match when true, otherwise `undefined`, in which
   * case you should respond with 406 "Not Acceptable".
   *
   * The `type` value may be a single MIME type string
   * such as "application/json", an extension name
   * such as "json", a comma-delimited list such as "json, html, text/plain",
   * an argument list such as `"json", "html", "text/plain"`,
   * or an array `["json", "html", "text/plain"]`. When a list
   * or array is given, the _best_ match, if any is returned.
   *
   * Examples:
   *
   *     // Accept: text/html
   *     req.accepts('html');
   *     // => "html"
   *
   *     // Accept: text/*, application/json
   *     req.accepts('html');
   *     // => "html"
   *     req.accepts('text/html');
   *     // => "text/html"
   *     req.accepts('json, text');
   *     // => "json"
   *     req.accepts('application/json');
   *     // => "application/json"
   *
   *     // Accept: text/*, application/json
   *     req.accepts('image/png');
   *     req.accepts('png');
   *     // => undefined
   *
   *     // Accept: text/*;q=.5, application/json
   *     req.accepts(['html', 'json']);
   *     req.accepts('html', 'json');
   *     req.accepts('html, json');
   *     // => "json"
   *
   * @param {String|Array} type(s)
   * @return {String|Array|Boolean}
   * @public
   */

  accepts () {
    const accept = accepts(this)
    return accept.types.apply(accept, arguments)
  }

  /**
   * Parses and normalizes the headers
   * @param lambdaEvent
   */
  static parseHeaders (lambdaEvent) {
    return _has(lambdaEvent, 'headers')
      ? _transform(lambdaEvent.headers, (result, val, key) => {
        key = key.toLowerCase()
        result[key] = val
        // set 'referrer' too because the internet can't decide
        if (key === 'referer') {
          result['referrer'] = val
        }
      })
      : {}
  }

  /**
   * Parses and normalizes the cookies
   * @param cookieString
   */
  static parseCookies (cookieString) {
    return _transform(cookie.parse(_toString(cookieString)), (result, val, key) => {
      result[key.toLowerCase()] = Request.valueFilter(val)
    }) || {}
  }

  /**
   * Parses body
   * @param lambdaEvent
   */
  static parseBody (lambdaEvent) {
    const bodyString = _get(lambdaEvent, 'body', '')
    if (typeof bodyString === 'object') {
      return bodyString
    }

    let body = null
    if (typeof bodyString === 'string') {
      try {
        body = JSON.parse(bodyString)
      } catch (_) {}
    }
    return body
  }

  /**
   * Converts 'null' to null, 'false' to false, etc
   * @param (val) val
   */
  static valueFilter (val) {
    if (typeof val !== 'string') {
      return val
    }

    const testVal = val.toLowerCase()

    if (testVal === 'true') {
      return true
    }

    if (testVal === 'false') {
      return false
    }

    if (testVal === 'null') {
      return null
    }

    return val
  }
}

module.exports = Request
