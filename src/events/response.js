'use strict'
const _toString = require('lodash.tostring')
const _transform = require('lodash.transform')
const cookie = require('cookie')
const mime = require('mime')
const normalizeHeader = require('header-case-normalizer')

const corsHeader = {
  'Access-Control-Allow-Origin': '*',
}

/**
 * Turns a lambda-proxy integration event into an express.js-like
 * response object ready to be based to the callback
 *
 * A lot was borrowed from here https://expressjs.com/en/api.html#res
 * and https://github.com/expressjs/express/blob/master/lib/response.js (Thanks!)
 *
 * @module lambda-proxy-utils
 * @class Response
 */
class Response {
  /**
   * Options = {
   *  statusCode: 200
   *  headers: { } <-- will merge headers
   *  body: '' <-- sets default body
   *  cors: true <-- adds cors headers
   * }
   * @param {object} [options]
   */
  constructor (options) {
    const opts = options || {}
    /**
     * HTTP status code to respond with
     * @type {number}
     */
    this.statusCode = opts.statusCode || 200

    /**
     * Body to send, which will be JSON stringified if its not a string
     * @type {string}
     */
    this.body = ''

    /**
     * Map of lowercase headers to include with the request
     * @type {{}}
     */
    this.headers = {}

    if (typeof opts.headers === 'object') {
      for (const key in opts.headers) {
        this.set(key, opts.headers[key])
      }
    }

    /**
     * Indicates whether this is cors or not,
     * if so it'll add headers
     * @type {boolean}
     */
    this.cors = opts.cors

    if (this.cors) {
      this.set(corsHeader)
    }

    /**
     * @type {boolean}
     */
    this.isBase64Encoded = !!opts.isBase64Encoded
  }

  /**
   * Creates a response.
   *
   * Examples:
   *
   *     res.send({ some: 'json' });
   *     res.send('some text');
   *
   *     returns and object like:
   *      {
   *        statusCode: 200,
   *        headers: {
   *          'Content-Type': 'text/plain' ,
   *          'Content-Length': '9'
   *        },
   *        body: 'some text'
   *     }
   *
   * @param {string|number|boolean|object} [body]
   * @returns {object}
   */
  send (body) {
    body = typeof body === 'undefined' ? this.body : body

    switch (typeof body) {
      // string defaulting to plain text
      case 'string':
        if (!this.get('Content-Type')) {
          this.contentType('text')
        }
        break
      case 'boolean':
      case 'number':
      case 'object':
        if (body === null) {
          body = ''
          if (!this.get('Content-Type')) {
            this.contentType('text')
          }
        } else {
          return this.json(body)
        }
        break
    }

    const res = {
      statusCode: this.statusCode,
      headers: _transform(this.headers, (result, val, key) => {
        result[normalizeHeader(key)] = val
      }),
      body: body,
    }

    if (this.isBase64Encoded) {
      res.isBase64Encoded = true
    }
    return res
  }

  /**
   * Creates JSON response.
   *
   * Examples:
   *
   *     res.json(null);
   *     res.json({ user: 'tj' });
   *
   * @param {string|number|boolean|object} obj
   */
  json (obj) {
    this.contentType('json')
    return this.send(JSON.stringify(obj))
  }

  /**
   * Set cookie `name` to `value`, with the given `options`.
   *
   * Options:
   *
   *    - `maxAge`   max-age in milliseconds, converted to `expires`
   *    - `path`     defaults to "/"
   *
   * Examples:
   *
   *    // "Remember Me" for 15 minutes
   *    res.cookie('rememberme', '1', { expires: new Date(Date.now() + 900000), httpOnly: true });
   *
   *    // save as above
   *    res.cookie('rememberme', '1', { maxAge: 900000, httpOnly: true })
   *
   * @param {String} name
   * @param {String|Object} value
   * @param {object} [options]
   * @return {Response} for chaining
   * @public
   */
  cookie (name, value, options) {
    const opts = options || {}

    const val = typeof value === 'object'
      ? `j:${JSON.stringify(value)}`
      : _toString(value)

    if (!opts.path) {
      opts.path = '/'
    }

    if ('maxAge' in opts) {
      opts.expires = new Date(Date.now() + opts.maxAge)
      opts.maxAge /= 1000
    }

    this.append('Set-Cookie', cookie.serialize(name, val, opts))
    return this
  }

  /**
   * Get value for header `field`.
   *
   * @param {String} field
   * @return {String}
   * @public
   */
  get (field) {
    return this.headers[field.toLowerCase()]
  }

  /**
   * Set header `field` to `val`, or pass
   * an object of header fields.
   *
   * Examples:
   *
   *    res.set('Foo', ['bar', 'baz']);
   *    res.set('Accept', 'application/json');
   *    res.set({ Accept: 'text/plain', 'X-API-Key': 'tobi' });
   *
   * Aliased as `res.header()`.
   *
   * @param {String|Object} field
   * @param {String|Array} [val]
   * @return {Response} for chaining
   * @public
   */
  set (field, val) {
    if (arguments.length === 2) {
      const value = Array.isArray(val)
        ? val.map(_toString)
        : _toString(val)

      this.headers[field.toLowerCase()] = value
    } else {
      for (const key in field) {
        this.set(key, field[key])
      }
    }
    return this
  }

  /**
   * Append additional header `field` with value `val`.
   *
   * Example:
   *
   *    res.append('Link', ['<http://localhost/>', '<http://localhost:3000/>']);
   *    res.append('Set-Cookie', 'foo=bar; Path=/; HttpOnly');
   *    res.append('Warning', '199 Miscellaneous warning');
   *
   * @param {String} field
   * @param {String|Array} val
   * @return {Response} for chaining
   * @public
   */
  append (field, val) {
    const previousValue = this.get(field)

    if (previousValue) {
      val = Array.isArray(previousValue)
        ? previousValue.concat(val)
        : Array.isArray(val)
          ? [previousValue].concat(val)
          : [previousValue, val]
    }

    return this.set(field, val)
  }

  /**
   * Set status `code`.
   *
   * @param {Number} code
   * @return {Response}
   * @public
   */
  status (code) {
    this.statusCode = code
    return this
  }

  /**
   * Set _Content-Type_ response header with `type` through `mime.lookup()`
   * when it does not contain "/", or set the Content-Type to `type` otherwise.
   *
   * Examples:
   *
   *     res.type('.html');
   *     res.type('html');
   *     res.type('json');
   *     res.type('application/json');
   *     res.type('png');
   *
   * @param {String} type
   * @return {Response} for chaining
   * @public
   */
  contentType (type) {
    const ct = type.indexOf('/') === -1
      ? mime.lookup(type)
      : type

    return this.set('Content-Type', ct)
  }
}

module.exports = Response
