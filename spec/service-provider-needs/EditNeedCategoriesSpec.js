/*
global describe, beforeEach, afterEach, it, expect
*/

'use strict'

import sinon from 'sinon'
import adminUrls from '../../src/js/admin-urls'
import ajax from '../../src/js/ajax'
import endpoints from '../../src/js/api-endpoints'
import browser from '../../src/js/browser'
import getUrlParameter from '../../src/js/get-url-parameter'

import Model from '../../src/js/models/service-provider-needs/EditCategories'

describe('Editing Service Provider Need Categories', () => {
  let model = null
  let ajaxGetStub = null
  let browserLoadingStub = null
  let browserLoadedStub = null

  beforeEach(() => {
    browserLoadingStub = sinon.stub(browser, 'loading')
    browserLoadedStub = sinon.stub(browser, 'loaded')
    ajaxGetStub = sinon
      .stub(ajax, 'get')
    ajaxGetStub
      .withArgs(endpoints.needCategories)
      .returns({
        then: function (success, error) {
          success({
            'statusCode': 200,
            'data': catData
          })
        }
      })
    ajaxGetStub
      .withArgs(endpoints.getServiceProviders + '/albert-kennedy-trust')
      .returns({
        then: function (success, error) {
          success({
            'statusCode': 200,
            'data': providerData
          })
        }
      })
    sinon
      .stub(getUrlParameter, 'parameter')
      .withArgs('providerId')
      .returns('albert-kennedy-trust')

    model = new Model()
  })

  afterEach(() => {
    ajax.get.restore()
    getUrlParameter.parameter.restore()
    browser.loading.restore()
    browser.loaded.restore()
  })

  it('- Should notify user it is loading', () => {
    expect(browserLoadingStub.calledOnce).toBeTruthy()
    expect(browserLoadingStub.calledBefore(ajaxGetStub)).toBeTruthy()
  })

  it('- Should list categories', () => {
    expect(model.categories().length).toEqual(10)
  })

  it('- Should sort categories alphabetically', () => {
    expect(model.categories()[0].key).toEqual('bedding')
  })

  it('- Should notify user it is loaded', () => {
    expect(browserLoadedStub.calledAfter(browserLoadingStub)).toBeTruthy()
    expect(browserLoadedStub.calledAfter(ajaxGetStub)).toBeTruthy()
  })

  it('- Should set ticked categories', () => {
    expect(model.categories().filter((c) => !c.isChecked()).length).toEqual(8)
    expect(model.categories().filter((c) => c.key === 'food-and-drink')[0].isChecked()).toBeTruthy()
    expect(model.categories().filter((c) => c.key === 'services')[0].isChecked()).toBeTruthy()
  })

  it('- Should set back link', () => {
    expect(model.backUrl()).toEqual(adminUrls.serviceProviders + '?key=albert-kennedy-trust')
  })

  describe('- Save', () => {
    let ajaxPutStub = null

    beforeEach(() => {
      browserLoadingStub.reset()
      browserLoadedStub.reset()

      ajaxPutStub = sinon
        .stub(ajax, 'put')
        .returns({
          then: function (success, error) {
            success({
              'statusCode': 200
            })
          }
        })

      model.categories()[4].isChecked(false) // food-and-drink
      model.categories()[1].isChecked(true) // cleaning-materials
      model.save()
    })

    afterEach(() => {
      ajax.put.restore()
    })

    it('- Should show user it is loading', () => {
      expect(browserLoadingStub.calledBefore(ajaxPutStub)).toBeTruthy()
    })

    it('- Should post selected categories to api', () => {
      const endpoint = endpoints.getServiceProviders + '/albert-kennedy-trust/needs/categories'
      const payload = [ 'cleaning-materials', 'services' ]
      expect(ajaxPutStub
        .withArgs(endpoint, payload)
        .calledAfter(browserLoadingStub)
      ).toBeTruthy()
      expect(model.isSubmitted()).toBeTruthy()
      expect(model.isSuccessful()).toBeTruthy()
    })

    it('- Should notify user it has loaded', () => {
      expect(browserLoadedStub.calledAfter(ajaxPutStub)).toBeTruthy()
    })
  })
})

const catData = [
  {
    'key': 'food-and-drink',
    'value': 'Food and Drink'
  },
  {
    'key': 'toiletries',
    'value': 'Toiletries'
  },
  {
    'key': 'clothes',
    'value': 'Clothes'
  },
  {
    'key': 'materials-for-activities',
    'value': 'Materials for Activities'
  },
  {
    'key': 'services',
    'value': 'Services (printing etc)'
  },
  {
    'key': 'furniture',
    'value': 'Furniture'
  },
  {
    'key': 'bedding',
    'value': 'Bedding'
  },
  {
    'key': 'cleaning-materials',
    'value': 'Cleaning Materials'
  },
  {
    'key': 'kitchenware',
    'value': 'Kitchenware'
  },
  {
    'key': 'electrical-items',
    'value': 'Electrical Items'
  }
]

const providerData = {
  'key': 'albert-kennedy-trust',
  'needCategories': ['food-and-drink', 'services']
}
