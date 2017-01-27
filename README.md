# lambda-proxy-utils
[![npm version](https://badge.fury.io/js/lambda-proxy-utils.svg)](https://badge.fury.io/js/lambda-proxy-utils)
[![Build Status](https://travis-ci.org/geoffdutton/lambda-proxy-utils.svg?branch=master)](https://travis-ci.org/geoffdutton/lambda-proxy-utils)
[![Coverage Status](https://coveralls.io/repos/github/geoffdutton/lambda-proxy-utils/badge.svg?branch=master)](https://coveralls.io/github/geoffdutton/lambda-proxy-utils?branch=master)
[![Dependency Status](https://david-dm.org/geoffdutton/lambda-proxy-utils.svg)](https://david-dm.org/geoffdutton/lambda-proxy-utils/)
[![Standard - JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](http://standardjs.com/)

Lambda event helpers for AWS API Gateway lambda-proxy integration

## Install
```
npm install --save lambda-proxy-utils
```

## Request
Takes an [API Gateway](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-set-up-lambda-proxy-integration-on-proxy-resource) lambda proxy integration event and returns an object that is similar to an express.js Request object.
```javascript
// Example API Gateway proxy integration event passed to lambda
{
  "resource": "/api/pipe/{pathParam}",
  "path": "/api/pipe/hooray/",
  "httpMethod": "GET",
  "headers": {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, sdch, br",
    "Accept-Language": "en-US,en;q=0.8",
    "Cache-Control": "no-cache",
    "CloudFront-Forwarded-Proto": "https",
    "CloudFront-Is-Desktop-Viewer": "true",
    "CloudFront-Is-Mobile-Viewer": "false",
    "CloudFront-Is-SmartTV-Viewer": "false",
    "CloudFront-Is-Tablet-Viewer": "false",
    "CloudFront-Viewer-Country": "US",
    "Cookie": "some=thing; testbool=false; testnull=null",
    "Host": "services.cheekyroad.com",
    "Pragma": "no-cache",
    "Referer": "https://cheekyroad.com/paht/?cool=true",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36",
    "Via": "1.1 1a1a1a1.cloudfront.net (CloudFront)",
    "X-Amz-Cf-Id": "2b2b2b2b2==",
    "X-Forwarded-For": "111.111.111.111, 222.222.222.222",
    "X-Forwarded-Port": "443",
    "X-Forwarded-Proto": "https"
  },
  "queryStringParameters": {
    "et": "something"
  },
  "pathParameters": {
    "pathParam": "hooray"
  },
  "stageVariables": null,
  "requestContext": {
    "accountId": "111111111111",
    "resourceId": "blah",
    "stage": "dev",
    "requestId": "08e3e2d0-daca-11e6-8d84-394b4374a71a",
    "identity": {
      "cognitoIdentityPoolId": null,
      "accountId": null,
      "cognitoIdentityId": null,
      "caller": null,
      "apiKey": null,
      "sourceIp": "111.111.111.111",
      "accessKey": null,
      "cognitoAuthenticationType": null,
      "cognitoAuthenticationProvider": null,
      "userArn": null,
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36",
      "user": null
    },
    "resourcePath": "/api/pipe/{pathParam}",
    "httpMethod": "GET",
    "apiId": "cdcd4"
  },
  "body": null,
  "isBase64Encoded": false
}

const Request = require('lambda-proxy-utils').Request

module.exports.lambdaHandler = funciton(event, context, callback) {
  const req = new Request(event)
  req.ip // '111.111.111.111'
  req.userAgent // 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36'
  
  // Get's a field value in the order of query string param -> cookie -> header
  req.get('host') // 'services.cheekyroad.com'
  req.get('testnull') // null
  
  // Or be specific
  req.getHeader('x-forwarded-proto') // 'https'
  
  // Check the type
  req.is('html') // false
}
```

## Response
Creates an express.js-like Response object, and outputs the API Gateway [response format](http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-output-format)
```javascript
const Response = require('lambda-proxy-utils').Response

module.exports.lambdaHandler = funciton(event, context, callback) {
  const res = new Response()
  // stringifies objects and set correct content type header
  callback(null, res.send({ some: 'object' }))
   /*
    {
      statusCode: 200,
      headers: {
          'Content-Type': 'application/json'
      },
      body: '{ "some": "object" }'
    }
   */
  
  // Support for CORS
  const res = new Response({ cors: true })
  callback(null, res.send({ some: 'object' }))
  /*
    {
      statusCode: 200,
      headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
      },
      body: '{ "some": "object" }'
    }
   */
}
```

## Contributing
I'd happily welcome pull requests. I've chosen to use Standard as the style with a few slight modifications. I'd like to keep the code coverage as high as possible.

## Credits
I borrowed a lot from (express)[https://github.com/expressjs/express]
