'use strict'
const binaryCase = require('binary-case')
const expect = require('chai').expect
const Response = require('../../src/events/response')

describe('events', () => {
  describe('Response', () => {
    describe('#set', () => {
      it('should set a lowercase key with value in headers object', () => {
        const res = new Response()
        expect(res.headers).to.eql({})
        res.set('Some', 'Header')
        expect(res.headers['some']).to.eq('Header')
      })

      it('should force a string', () => {
        const res = new Response()
        res.set('X-Limit', 2000)
        expect(res.headers['x-limit']).to.eq('2000')
      })

      it('should set a list of header values', () => {
        const res = new Response()
        res.set('X-Limits', [100, 200])
        expect(res.headers['x-limits']).to.eql(['100', '200'])
      })

      it('should set a an object of headers', () => {
        const res = new Response()
        res.set({
          'X-Limit': 200,
          'X-Blah': 'meh',
        })
        expect(res.headers['x-limit']).to.eq('200')
        expect(res.headers['x-blah']).to.eq('meh')
      })

      it('should be chainable', () => {
        const res = new Response()
        res.set({
          'X-Blah': 'meh',
        })
          .set('X-Limit', 200)

        expect(res.headers['x-limit']).to.eq('200')
        expect(res.headers['x-blah']).to.eq('meh')
      })
    })

    describe('#append', () => {
      it('should set key with value in headers object', () => {
        const res = new Response()
        expect(res.headers).to.eql({})
        res.append('Some', 'Header')
        expect(res.headers['some']).to.eq('Header')
      })

      it('should be overriden with set', () => {
        const res = new Response()
        res.append('X-Limits', [100, 200])
        res.set('X-Limits', 300)
        expect(res.headers['x-limits']).to.eq('300')
      })

      it('should be chainable', () => {
        const res = new Response()
        res.append('X-Blah', 'meh')
          .append('X-Blah', 200)
          .append('X-Blah', 'another')

        expect(res.headers['x-blah']).to.eql(['meh', '200', 'another'])
      })

      it('should convert previous value to an array if array is passed', () => {
        const res = new Response()
        res.set('X-Blah', 'meh')
          .append('X-Blah', [200])

        expect(res.headers['x-blah']).to.eql(['meh', '200'])
      })
    })

    describe('#status', () => {
      it('should set the status code', () => {
        const res = new Response()
        res.status(400)
        expect(res.statusCode).to.eq(400)
      })
    })

    describe('#contentType', () => {
      it('should set content type with mime look up', () => {
        const res = new Response()
        res.contentType('html')
        expect(res.headers['content-type']).to.eq('text/html')
      })

      it('should set content string with / content type', () => {
        const res = new Response()
        res.contentType('text/plain')
        expect(res.headers['content-type']).to.eq('text/plain')
      })
    })

    describe('#get', () => {
      it('should return undefined if nothing found', () => {
        const res = new Response()
        expect(res.get('something')).to.be.undefined
      })

      it('should be case insensitive', () => {
        const res = new Response()
        res.set('X-Api-Key', 'blahblah')
        expect(res.get('x-api-key')).to.eq('blahblah')
      })
    })

    describe('#cookie', () => {
      it('should add cookie header', () => {
        const res = new Response()
        res.cookie('some', 'value')
        expect(res.headers['set-cookie']).to.eql('some=value; Path=/')
      })

      it('should accept path as an options', () => {
        const res = new Response()
        res.cookie('some', 'value', { path: '/somepath' })
        expect(res.headers['set-cookie']).to.eql('some=value; Path=/somepath')
      })

      it('should be chainable', () => {
        const res = new Response()
        res.cookie('some', 'value')
          .cookie('another', 'value')

        expect(res.headers['set-cookie']).to.eql(['some=value; Path=/', 'another=value; Path=/'])
      })

      it('should handle a JSON-able object', () => {
        const res = new Response()
        res.cookie('guy', { blah: 'meh' })
        expect(res.headers['set-cookie']).to.eql(`guy=${encodeURIComponent('j:{"blah":"meh"}')}; Path=/`)
      })

      it('should support options', () => {
        const res = new Response()
        res.cookie('some', 'value', { secure: true, httpOnly: true })
        expect(res.headers['set-cookie']).to.eql('some=value; Path=/; HttpOnly; Secure')
      })

      it('should set max-age relative to now', () => {
        const res = new Response()
        res.cookie('some', 'value', { maxAge: 1000 })
        expect(res.headers['set-cookie'][0]).not.to.contain('Thu, 01 Jan 1970 00:00:01 GMT')
      })
    })

    describe('#send', () => {
      it('should return a lambda-proxy response', () => {
        const res = new Response()
        expect(res.send('blah')).to.eql({
          statusCode: 200,
          headers: { 'Content-Type': 'text/plain' },
          body: 'blah',
        })
      })

      it('should return normalized headers', () => {
        const res = new Response({
          headers: { 'X-Some-Header': 'some-val' },
        })
        expect(res.send('blah')).to.eql({
          statusCode: 200,
          headers: { 'Content-Type': 'text/plain', 'X-Some-Header': 'some-val' },
          body: 'blah',
        })
      })

      it('should not overwrite content type if set', () => {
        const res = new Response()
        res.contentType('html')
        expect(res.send('blah')).to.eql({
          statusCode: 200,
          headers: { 'Content-Type': 'text/html' },
          body: 'blah',
        })
      })

      it('should add isBase64Encoded if true', () => {
        const base64EmptyGif = 'R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
        const res = new Response({
          headers: {
            'Content-Type': 'image/gif',
          },
          isBase64Encoded: true,
        })
        expect(res.send(base64EmptyGif)).to.eql({
          statusCode: 200,
          headers: {
            'Content-Type': 'image/gif',
          },
          body: base64EmptyGif,
          isBase64Encoded: true,
        })
      })

      context('passing an object', () => {
        it('should return empty string if undefined', () => {
          const res = new Response()
          expect(res.send()).to.eql({
            statusCode: 200,
            headers: { 'Content-Type': 'text/plain' },
            body: '',
          })
        })

        it('should return empty string if null with content-type text/plain', () => {
          const res = new Response()
          res.set('Content-Type', 'text/html')
          expect(res.send(null)).to.eql({
            statusCode: 200,
            headers: { 'Content-Type': 'text/html' },
            body: '',
          })
        })

        it('should return empty string if null with set content-type', () => {
          const res = new Response()
          expect(res.send(null)).to.eql({
            statusCode: 200,
            headers: { 'Content-Type': 'text/plain' },
            body: '',
          })
        })

        it('should stringify if boolean', () => {
          const res = new Response()
          expect(res.send(false)).to.eql({
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(false),
          })
        })

        it('should stringify if number', () => {
          const res = new Response()
          expect(res.send(6000)).to.eql({
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(6000),
          })
        })

        it('should stringify and set content type', () => {
          const res = new Response()
          expect(res.send({ some: 'object' })).to.eql({
            statusCode: 200,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ some: 'object' }),
          })
        })
      })

      context('with cookies', () => {
        it('should return variations of Set-Cookie if more than 1 cookie', () => {
          const res = new Response()
          res.cookie('some', 'value')
            .cookie('another', 'value')

          const sent = res.send()
          expect(sent.headers['Set-Cookie']).to.be.a('string')
          expect(sent.headers['set-Cookie']).to.be.a('string')
        })

        it('should accept up to 512 cookies', () => {
          const res = new Response()
          for (let i = 0; i < 514; i++) {
            res.cookie(`some_${i}`, `value_${i}`)
          }

          const sent = res.send()
          for (let i = 0; i < 512; i++) {
            const setCookieCase = binaryCase('Set-Cookie', i, {
              allowOverflow: false,
            })

            if (i < 512) {
              expect(sent.headers[setCookieCase]).to.be.a('string')
            } else {
              expect(sent.headers[setCookieCase]).not.to.exist()
            }
          }
        })
      })
    })

    describe('#json', () => {
      it('should return a lambda-proxy response', () => {
        const res = new Response()
        expect(res.json({ blah: 'meh' })).to.eql({
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ blah: 'meh' }),
        })
      })
    })

    describe('constructor options', () => {
      it('should set status code', () => {
        const res = new Response({
          statusCode: 304,
        })
        expect(res.statusCode).to.eq(304)
      })

      it('should set headers', () => {
        const res = new Response({
          headers: { 'X-Some': 'Thing' },
        })
        expect(res.headers['x-some']).to.eq('Thing')
        res.set('Blah', '1')
        expect(Object.keys(res.headers)).to.have.lengthOf(2)
      })

      it('should add CORS header if true', () => {
        const res = new Response({
          cors: true,
        })
        expect(res.headers['access-control-allow-origin']).to.eq('*')
      })
    })
  })
})
