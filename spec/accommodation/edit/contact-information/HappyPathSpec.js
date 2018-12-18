/*
global describe, beforeEach, afterEach, it, expect
*/

'use strict'

const sinon = require('sinon')
const jsRoot = '../../../../src/js/'
const ajax = require(`${jsRoot}ajax`)
const auth = require(`${jsRoot}auth`)
const endpoints = require(`${jsRoot}api-endpoints`)
const browser = require(`${jsRoot}browser`)
const querystring = require(`${jsRoot}get-url-parameter`)

const { testData, publishedServiceProviderData } = require('../testData')

describe('Accommodation - Edit Contact Information', () => {
  const Model = require(`${jsRoot}models/accommodation/edit`)
  let sut = null

  let ajaxGetStub = null
  let browserLoadingStub = null
  let browserLoadedStub = null

  beforeEach(() => {
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')
    ajaxGetStub = sinon.stub(ajax, 'get')
    ajaxGetStub
      .withArgs(`${endpoints.temporaryAccommodation}/${testData.id}`)
      .returns({
        then: function (success, error) {
          success({
            'statusCode': 200,
            'data': testData
          })
        }
      })
    ajaxGetStub
      .returns({
        then: function (success, error) {
          success({
            'statusCode': 200,
            'data': publishedServiceProviderData
          })
        }
      })
    sinon.stub(auth, 'isSuperAdmin')
    sinon.stub(auth, 'getLocationsForUser').returns([])

    sinon.stub(querystring, 'parameter')
      .withArgs('id')
      .returns(testData.id)

    sut = new Model()
    sut.init()
  })

  afterEach(() => {
    ajax.get.restore()
    auth.isSuperAdmin.restore()
    auth.getLocationsForUser.restore()
    browser.loaded.restore()
    browser.loading.restore()
    querystring.parameter.restore()
  })

  it('- should notify user it is loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
  })

  it('- should load contact information name', () => {
    expect(sut.contactDetails().formFields().name()).toEqual('Vince Test')
  })

  it('- should load contact information additionalInfo', () => {
    expect(sut.contactDetails().formFields().additionalInfo()).toEqual('additionalInfo')
  })

  it('- should load contact information email', () => {
    expect(sut.contactDetails().formFields().email()).toEqual('test@test.com')
  })

  it('- should load contact information telephone', () => {
    expect(sut.contactDetails().formFields().telephone()).toEqual('telephone')
  })

  it('- should notify user it is loaded', () => {
    expect(browserLoadedStub.called).toBeTruthy()
  })

  describe('- edit contact information', () => {
    beforeEach(() => {
      sut.contactDetails().edit()

      sut.contactDetails().formFields().name('new name')
      sut.contactDetails().formFields().additionalInfo('new additionalInfo')
      sut.contactDetails().formFields().email('new-test@email.com')
      sut.contactDetails().formFields().telephone('new telephone')
    })

    it('- should set isEditable to true', () => {
      expect(sut.contactDetails().isEditable()).toBeTruthy()
    })

    describe('- submit', () => {
      let ajaxPatchStub = null

      beforeEach(() => {
        browserLoadingStub.reset()
        browserLoadedStub.reset()

        ajaxPatchStub = sinon.stub(ajax, 'patch')
          .returns({
            then: function (success, error) {
              success({
                'statusCode': 200
              })
            }
          })

        sut.contactDetails().save()
      })

      afterEach(() => {
        ajax.patch.restore()
      })

      it('- should notify user it is loading', () => {
        expect(browserLoadingStub.calledOnce).toBeTruthy()
      })

      it('- should patch new data', () => {
        const endpoint = `${endpoints.temporaryAccommodation}/${testData.id}/contact-details`
        const payload = {
          'Name': 'new name',
          'AdditionalInfo': 'new additionalInfo',
          'Email': 'new-test@email.com',
          'Telephone': 'new telephone'
        }
        const patchAsExpected = ajaxPatchStub
          .withArgs(endpoint, payload)
          .calledAfter(browserLoadingStub)
        expect(patchAsExpected).toBeTruthy()
      })

      it('- should notify user it has loaded', () => {
        expect(browserLoadedStub.calledAfter(ajaxPatchStub)).toBeTruthy()
      })

      it('- should set contact details to read only', () => {
        expect(sut.contactDetails().isEditable()).toBeFalsy()
      })

      describe('- edit again, then cancel', () => {
        beforeEach(() => {
          sut.contactDetails().formFields().name('another name')
          sut.contactDetails().formFields().additionalInfo('another additionalInfo')
          sut.contactDetails().formFields().email('another-email@test.com')
          sut.contactDetails().formFields().telephone('another telephone')

          sut.contactDetails().cancel()
        })

        it('- should set isEditable to false', () => {
          expect(sut.contactDetails().isEditable()).toBeFalsy()
        })

        it('- should reset fields', () => {
          expect(sut.contactDetails().formFields().name()).toEqual('new name')
          expect(sut.contactDetails().formFields().additionalInfo()).toEqual('new additionalInfo')
          expect(sut.contactDetails().formFields().email()).toEqual('new-test@email.com')
          expect(sut.contactDetails().formFields().telephone()).toEqual('new telephone')
        })
      })
    })

    describe('- cancel', () => {
      beforeEach(() => {
        sut.contactDetails().cancel()
      })

      it('- should set isEditable to false', () => {
        expect(sut.contactDetails().isEditable()).toBeFalsy()
      })

      it('- should reset fields', () => {
        expect(sut.contactDetails().formFields().name()).toEqual(testData.contactInformation.name)
        expect(sut.contactDetails().formFields().additionalInfo()).toEqual(testData.contactInformation.additionalInfo)
        expect(sut.contactDetails().formFields().email()).toEqual(testData.contactInformation.email)
        expect(sut.contactDetails().formFields().telephone()).toEqual(testData.contactInformation.telephone)
      })
    })
  })
})
