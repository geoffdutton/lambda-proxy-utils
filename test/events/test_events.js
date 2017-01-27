'use strict'
/* eslint-disable */
const cloneDeep = require('lodash.clonedeep')

module.exports._GET = {
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

module.exports.GET = () => cloneDeep(module.exports._GET)