/*
global describe, beforeEach, afterEach, it, expect
*/

'use strict'

var sinon = require('sinon')
var ajax = require('../../src/js/ajax')
var endpoints = require('../../src/js/api-endpoints')
var cookies = require('../../src/js/cookies')
var browser = require('../../src/js/browser')
var getUrlParameter = require('../../src/js/get-url-parameter')

describe('Verify New User', () => {
  let Model = require('../../src/js/models/Auth/VerifyUser')
  let model = null

  beforeEach(() => {
    sinon.stub(browser, 'loading')
    sinon.stub(browser, 'loaded')
    model = new Model()
  })

  afterEach(() => {
    browser.loaded.restore()
    browser.loading.restore()
  })

  it('should start with errors false', () => {
    expect(model.hasErrors()).toBeFalsy()
  })

  describe('Save', () => {
    let stubbedApi = null
    beforeEach(() => {
      let fakeResolved = {
        then: function (success, _) {
          success({
            'statusCode': 201
          })
        }
      }

      stubbedApi = sinon.stub(ajax, 'post').returns(fakeResolved)
      sinon.stub(cookies, 'get').returns('stored-session-token')
      sinon.stub(getUrlParameter, 'parameter').returns('verification-token')

      model.username('username')
      model.password('password')
      model.save()
    })

    afterEach(() => {
      ajax.post.restore()
      cookies.get.restore()
      getUrlParameter.parameter.restore()
    })

    it('should post service provider name to api', () => {
      var endpoint = endpoints.verifiedUsers
      var payload = {
        'UserName': 'username',
        'Password': 'password',
        'VerificationToken': 'verification-token'
      }
      var apiCalledWithExpectedArgs = stubbedApi.withArgs(endpoint, payload).calledOnce
      expect(apiCalledWithExpectedArgs).toBeTruthy()
    })

    it('should set message', () => {
      expect(model.message()).toEqual('User verified. You can now log in.')
    })

    it('should set userCreated to true', () => {
      expect(model.userCreated()).toBeTruthy()
    })
  })

  describe('Save fail', () => {
    beforeEach(() => {
      let fakeResolved = {
        then: (result, error) => {
          result({
            'statusCode': 400,
            'data': {
              'messages': ['returned error message 1', 'returned error message 2']
            }
          })
        }
      }

      sinon.stub(ajax, 'post').returns(fakeResolved)
      sinon.stub(cookies, 'get').returns('stored-session-token')
      sinon.stub(getUrlParameter, 'parameter').returns('verification-token')

      model.username('username')
      model.password('password')
      model.save()
    })

    afterEach(() => {
      ajax.post.restore()
      cookies.get.restore()
      getUrlParameter.parameter.restore()
    })

    it('set errors in message', () => {
      expect(model.errors()[0]).toEqual('returned error message 1')
      expect(model.errors()[1]).toEqual('returned error message 2')
    })

    it('should set userCreated to false', () => {
      expect(model.userCreated()).toBeFalsy()
    })
  })
})
