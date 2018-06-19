/* global XMLHttpRequest */

var Q = require('q')
var browser = require('./browser')
import storage from './localStorage'

var post = function (url, headers, data, isCustomErrorHandling) {
  if (Object.keys(headers).length === 0) {
    headers = {
      'content-type': 'application/json'
    }
  }
  return makeRequest({
    method: 'POST',
    url: url,
    headers: headers,
    data: data,
    isCustomErrorHandling: isCustomErrorHandling
  }).promise
}

var put = function (url, headers, data) {
  if (Object.keys(headers).length === 0) {
    headers = {
      'content-type': 'application/json'
    }
  }
  return makeRequest({
    method: 'PUT',
    url: url,
    headers: headers,
    data: data
  }).promise
}

var patch = function (url, headers, data) {
  if (Object.keys(headers).length === 0) {
    headers = {
      'content-type': 'application/json'
    }
  }
  return makeRequest({
    method: 'PATCH',
    url: url,
    headers: headers,
    data: data
  }).promise
}

var get = function (url, headers) {
  return makeRequest({
    method: 'GET',
    url: url,
    headers: headers
  }).promise
}

var _delete = function (url, headers) {
  return makeRequest({
    method: 'DELETE',
    url: url,
    headers: headers
  }).promise
}

var makeRequest = function (options) {
  var deferred = Q.defer()
  var req = new XMLHttpRequest()
  req.open(options.method, options.url, true)

  for (var key in options.headers) {
    if (options.headers.hasOwnProperty(key)) {
      req.setRequestHeader(key, options.headers[key])
    }
  }
  req.setRequestHeader('Authorization', 'Bearer ' + storage.get('id_token')
  )

  var parseResponseText = function (response) {
    if (response.responseText.length) {
      var parsed = JSON.parse(response.responseText)
      return parsed
    }
    return {}
  }

  req.onload = function () {
    if (this.status === 201) {
      deferred.resolve({
        'status': 'created',
        'statusCode': this.status,
        'data': parseResponseText(this)
      })
    } else if (this.status === 200) {
      deferred.resolve({
        'status': 'ok',
        'statusCode': this.status,
        'data': parseResponseText(this)
      })
    } else if (this.status === 400) {
      deferred.resolve({
        'status': 'badrequest',
        'statusCode': this.status,
        'data': parseResponseText(this)
      })
    } else if (this.status === 401 && !options.isCustomErrorHandling) {
      browser.redirect('/login')
    } else if (this.status === 403 && !options.isCustomErrorHandling) {
      browser.redirect('/403.html')
    } else {
      deferred.resolve({
        'status': 'error',
        'statusCode': this.status,
        'data': parseResponseText(this)
      })
    }
  }

  req.onerror = function () {
    deferred.reject(new Error('Server responded with a status of ' + req.status))
  }

  if (options.data !== undefined) {
    req.send(JSON.stringify(options.data))
  } else {
    req.send()
  }

  return deferred
}
module.exports = {
  get: get,
  post: post,
  patch: patch,
  put: put,
  delete: _delete
}
