'use strict'
import { expect } from 'chai'
import Response from '../../src/events/response'

describe('events', () => {
  describe('Response', () => {
    describe('#set', () => {
      it('should set key with value in headers object', () => {
        const res = new Response()
        expect(res.headers).to.eql({})
        res.set('Some', 'Header')
        expect(res.headers['Some']).to.eq('Header')
      })

      it('should force a string', () => {
        const res = new Response()
        res.set('X-Limit', 2000)
        expect(res.headers['X-Limit']).to.eq('2000')
      })

      it('should set a list of header values', () => {
        const res = new Response()
        res.set('X-Limits', [100, 200])
        expect(res.headers['X-Limits']).to.eql(['100', '200'])
      })

      it('should set a an object of headers', () => {
        const res = new Response()
        res.set({
          'X-Limit': 200,
          'X-Blah': 'meh',
        })
        expect(res.headers['X-Limit']).to.eq('200')
        expect(res.headers['X-Blah']).to.eq('meh')
      })

      it('should be chainable', () => {
        const res = new Response()
        res.set({
          'X-Blah': 'meh',
        })
          .set('X-Limit', 200)

        expect(res.headers['X-Limit']).to.eq('200')
        expect(res.headers['X-Blah']).to.eq('meh')
      })
    })

    describe('#append', () => {
      it('should set key with value in headers object', () => {
        const res = new Response()
        expect(res.headers).to.eql({})
        res.append('Some', 'Header')
        expect(res.headers['Some']).to.eq('Header')
      })

      it('should be overriden with set', () => {
        const res = new Response()
        res.append('X-Limits', [100, 200])
        res.set('X-Limits', 300)
        expect(res.headers['X-Limits']).to.eq('300')
      })

      it('should be chainable', () => {
        const res = new Response()
        res.append('X-Blah', 'meh')
          .append('X-Blah', 200)

        expect(res.headers['X-Blah']).to.eql(['meh', '200'])
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
        expect(res.headers['Content-Type']).to.eq('text/html')
      })

      it('should set content string with / content type', () => {
        const res = new Response()
        res.contentType('text/plain')
        expect(res.headers['Content-Type']).to.eq('text/plain')
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
        expect(res.headers['Set-Cookie']).to.eql('some=value; Path=/')
      })

      it('should be chainable', () => {
        const res = new Response()
        res.cookie('some', 'value')
          .cookie('another', 'value')

        expect(res.headers['Set-Cookie']).to.eql(['some=value; Path=/', 'another=value; Path=/'])
      })

      it('should handle a JSON-able object', () => {
        const res = new Response()
        res.cookie('guy', { blah: 'meh' })
        expect(res.headers['Set-Cookie']).to.eql(`guy=${encodeURIComponent('j:{"blah":"meh"}')}; Path=/`)
      })

      it('should support options', () => {
        const res = new Response()
        res.cookie('some', 'value', { secure: true, httpOnly: true })
        expect(res.headers['Set-Cookie']).to.eql('some=value; Path=/; HttpOnly; Secure')
      })

      it('should set max-age relative to now', () => {
        const res = new Response()
        res.cookie('some', 'value', { maxAge: 1000 })
        expect(res.headers['Set-Cookie'][0]).not.to.contain('Thu, 01 Jan 1970 00:00:01 GMT')
      })
    })

    describe('#send', () => {
      it('should return a lambda-proxy response', () => {
        const res = new Response()
        expect(res.send('blah')).to.eql({
          statusCode: 200,
          headers: {},
          body: 'blah',
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
        expect(res.headers['X-Some']).to.eq('Thing')
        res.set('Blah', '1')
        expect(Object.keys(res.headers)).to.have.lengthOf(2)
      })

      it('should add CORS header if true', () => {
        const res = new Response({
          cors: true,
        })
        expect(res.headers['Access-Control-Allow-Origin']).to.eq('*')
      })
    })
  })
})
