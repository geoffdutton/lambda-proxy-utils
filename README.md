# lambda-proxy-utils
[![Build Status](https://travis-ci.org/geoffdutton/lambda-proxy-utils.svg?branch=master)](https://travis-ci.org/geoffdutton/lambda-proxy-utils)

Lambda event helpers for AWS API Gateway lambda-proxy integration

## Request
Takes an API Gateway lambda-proxy integration event and returns an object that is similar to an express.js Request object.

## Response
Creates an express.js-like Response object, and outputs the API Gateway response format