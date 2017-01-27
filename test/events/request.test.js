'use strict'
const expect = require('chai').expect
const Request = require('../../src/events/request')
const GET = require('./test_events').GET
const urlParse = require('url-parse')

describe('events', () => {
  describe('Request', () => {
    let lambdaEvent

    beforeEach(() => {
      lambdaEvent = GET()
    })

    context('GET', () => {
      it('should set defaults', () => {
        const req = new Request()
        expect(req.body).to.be.null
        expect(req.headers).to.eql({})
        expect(req.cookies).to.eql({})
        expect(req.ip).to.eq('')
        expect(req.params).to.eql({})
        expect(req.query).to.eql({})
        expect(req.path).to.eq('')
        expect(req.xhr).to.be.false
        expect(req.method).to.eq('GET')
        expect(req.referrer).to.eql(urlParse('', true))
        expect(req.userAgent).to.eq('')
      })

      it('should parse headers', () => {
        const req = new Request(lambdaEvent)
        expect(req.headers).to.eql({
          'accept': '*/*',
          'accept-encoding': 'gzip, deflate, sdch, br',
          'accept-language': 'en-US,en;q=0.8',
          'cache-control': 'no-cache',
          'cloudfront-forwarded-proto': 'https',
          'cloudfront-is-desktop-viewer': 'true',
          'cloudfront-is-mobile-viewer': 'false',
          'cloudfront-is-smarttv-viewer': 'false',
          'cloudfront-is-tablet-viewer': 'false',
          'cloudfront-viewer-country': 'US',
          'cookie': 'some=thing; testbool=false; testnull=null',
          'host': 'services.cheekyroad.com',
          'pragma': 'no-cache',
          'referer': 'https://cheekyroad.com/paht/?cool=true',
          'referrer': 'https://cheekyroad.com/paht/?cool=true',
          'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36', // eslint-disable-line max-len
          'via': '1.1 1a1a1a1.cloudfront.net (CloudFront)',
          'x-amz-cf-id': '2b2b2b2b2==',
          'x-forwarded-for': '111.111.111.111, 222.222.222.222',
          'x-forwarded-port': '443',
          'x-forwarded-proto': 'https',
        })
      })

      it('should parse cookies', () => {
        const req = new Request(lambdaEvent)
        expect(req.cookies).to.eql({
          some: 'thing',
          testbool: false,
          testnull: null,
        })
      })

      it('should parse path params', () => {
        const req = new Request(lambdaEvent)
        expect(req.params).to.eql({
          pathParam: 'hooray',
        })
      })

      it('should parse query params', () => {
        const req = new Request(lambdaEvent)
        expect(req.query).to.eql({
          et: 'something',
        })
      })

      it('should parse referrer url', () => {
        const req = new Request(lambdaEvent)
        expect(req.referrer).to.eql(urlParse('https://cheekyroad.com/paht/?cool=true', true))
      })

      it('should set other properties', () => {
        const req = new Request(lambdaEvent)
        expect(req.ip).to.eq('111.111.111.111')
        expect(req.userAgent).to.eq('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36') // eslint-disable-line max-len
        expect(req.method).to.eq('GET')
        expect(req.path).to.eq('/api/pipe/hooray/')
        expect(req.xhr).to.be.false
      })
    })

    context('with JSON body', () => {
      it('should parse JSON', () => {
        const body = { some: 'object', thing: true }
        lambdaEvent.body = body
        let req = new Request(lambdaEvent)
        expect(req.body).to.eql(body)

        lambdaEvent.body = JSON.stringify(body)
        req = new Request(lambdaEvent)
        expect(req.body).to.eql(body)
      })
    })

    describe('#get', () => {
      it('should return undefined', () => {
        const req = new Request(lambdaEvent)
        expect(req.get('nothing_That_exists')).to.be.undefined
      })

      it('should get query param first', () => {
        lambdaEvent.queryStringParameters = { find: 'me1' }
        lambdaEvent.headers.Cookie = 'find=me2'
        lambdaEvent.headers['Find'] = 'me3'
        const req = new Request(lambdaEvent)
        expect(req.get('find')).to.eq('me1')
      })

      it('should get cookie second', () => {
        lambdaEvent.headers.Cookie = 'find=me2'
        lambdaEvent.headers['Find'] = 'me3'
        const req = new Request(lambdaEvent)
        expect(req.get('find')).to.eq('me2')
      })

      it('should get header third', () => {
        lambdaEvent.headers['Find'] = 'me3'
        const req = new Request(lambdaEvent)
        expect(req.get('find')).to.eq('me3')
      })
    })

    describe('#getCookie', () => {
      it('should return undefined', () => {
        const req = new Request(lambdaEvent)
        expect(req.getCookie('nothing_That_exists')).to.be.undefined
      })

      it('should be case-insensitive', () => {
        lambdaEvent.headers.Cookie = 'Find=me2'
        const req = new Request(lambdaEvent)
        expect(req.getCookie('fInd')).to.eq('me2')
      })
    })

    describe('#getHeader', () => {
      it('should return undefined', () => {
        const req = new Request(lambdaEvent)
        expect(req.getHeader('nothing_That_exists')).to.be.undefined
      })

      it('should be case-insensitive', () => {
        lambdaEvent.headers['Find'] = 'me2'
        const req = new Request(lambdaEvent)
        expect(req.getHeader('fInd')).to.eq('me2')
      })
    })

    describe('#getQueryParam', () => {
      it('should return undefined', () => {
        const req = new Request(lambdaEvent)
        expect(req.getQueryParam('nothing_That_exists')).to.be.undefined
      })

      it('should parse bools', () => {
        lambdaEvent.queryStringParameters['success'] = 'true'
        let req = new Request(lambdaEvent)
        expect(req.getQueryParam('success')).to.be.true

        lambdaEvent.queryStringParameters['success'] = 'false'
        req = new Request(lambdaEvent)
        expect(req.getQueryParam('success')).to.be.false
      })

      it('should parse null', () => {
        lambdaEvent.queryStringParameters['success'] = 'null'
        const req = new Request(lambdaEvent)
        expect(req.getQueryParam('success')).to.be.null
      })
    })

    describe('#is', () => {
      it('should match partial', () => {
        lambdaEvent.headers['Content-Type'] = 'text/html; charset=utf-8'
        const req = new Request(lambdaEvent)
        expect(req.is('html')).to.be.true
        expect(req.is('text/html')).to.be.true
        expect(req.is('text/*')).to.be.true
        expect(req.is('json')).to.be.false
      })

      it('should get cookie second', () => {
        lambdaEvent.headers.Cookie = 'find=me2'
        lambdaEvent.headers['Find'] = 'me3'
        const req = new Request(lambdaEvent)
        expect(req.get('find')).to.eq('me2')
      })

      it('should get header third', () => {
        lambdaEvent.headers['Find'] = 'me3'
        const req = new Request(lambdaEvent)
        expect(req.get('find')).to.eq('me3')
      })
    })

    describe('#valueFilter', () => {
      it('should not lowercase the value', () => {
        expect(Request.valueFilter('SomeThing')).to.eq('SomeThing')
      })
    })
  })
})
