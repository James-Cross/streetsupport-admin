
  /*
global describe, beforeEach, afterEach, it, expect
*/

'use strict'

const sinon = require('sinon')
const ajax = require('../../src/js/ajax')
const browser = require('../../src/js/browser')
const endpoints = require('../../src/js/api-endpoints')
const getUrlParameter = require('../../src/js/get-url-parameter')

describe('Service', () => {
  const Model = require('../../src/js/models/Service')
  let model = null

  beforeEach(() => {
    model = new Model(getData())
  })

  it('should set link to edit each service', () => {
    expect(model.editServiceUrl).toEqual('/edit-service-provider-service.html?providerId=coffee4craig&serviceId=569d2b468705432268b65c75')
  })

  describe('Editing', () => {
    beforeEach(() => {
      model.edit()
    })

    it('should set isEditing to true', () => {
      expect(model.isEditing).toBeTruthy()
    })

    describe('Cancel', () => {
      beforeEach(() => {
        model.info('new info')
        model.tags('new tags')
        model.openingTimes()[1].startTime('20:00')
        model.openingTimes()[1].endTime('22:00')
        model.openingTimes()[1].day('Wednesday')
        model.address.street1('new street 1')
        model.cancelEdit()
      })

      it('should set isEditing to false', () => {
        expect(model.isEditing()).toBeFalsy()
      })

      it('should set reset fields', () => {
        expect(model.name).toEqual('Meals')
        expect(model.info()).toEqual('Breakfast')
        expect(model.tags()).toEqual('some tags')
        expect(model.openingTimes()[1].startTime()).toEqual('09:00')
        expect(model.openingTimes()[1].endTime()).toEqual('10:00')
        expect(model.openingTimes()[1].day()).toEqual('Tuesday')
        expect(model.address.street1()).toEqual('Booth Centre')
      })
    })

    describe('Save', () => {
      let stubbedApi = null

      beforeEach(() => {
        const fakeResolved = {
          then: function (success, error) {
            success({
              'statusCode': 200,
              'data': getData()
            })
          }
        }

        stubbedApi = sinon.stub(ajax, 'put').returns(fakeResolved)
        sinon.stub(getUrlParameter, 'parameter').returns('coffee4craig')

        model.info('new info')
        model.tags('new tags, tag 2')
        model.openingTimes()[1].startTime('20:00')
        model.openingTimes()[1].endTime('22:00')
        model.openingTimes()[1].day('Wednesday')
        model.address.street1('new street 1')
        model.address.street2('new street 2')
        model.address.street3('new street 3')
        model.address.street4('new street 4')
        model.address.city('new city')
        model.address.postcode('new postcode')

        model.save()
      })

      afterEach(() => {
        ajax.put.restore()
        getUrlParameter.parameter.restore()
      })

      it('should put service details with new to api', () => {
        var endpoint = endpoints.getServiceProviders + '/coffee4craig/services/569d2b468705432268b65c75'
        var payload = {
          'Info': 'new info',
          'LocationDescription': undefined,
          'Tags': ['new tags', 'tag 2'],
          'OpeningTimes': [{
            'StartTime': '09:00',
            'EndTime': '10:00',
            'Day': 'Monday'
          }, {
            'StartTime': '20:00',
            'EndTime': '22:00',
            'Day': 'Wednesday'
          }],
          'Address': {
            'Street1': 'new street 1',
            'Street2': 'new street 2',
            'Street3': 'new street 3',
            'Street4': 'new street 4',
            'City': 'new city',
            'Postcode': 'new postcode'
          }
        }

        var apiCalledWithExpectedArgs = stubbedApi.withArgs(endpoint, payload).calledOnce
        expect(apiCalledWithExpectedArgs).toBeTruthy()
      })

      it('should set isEditing to false', () => {
        expect(model.isEditing()).toBeFalsy()
      })

      describe('Edit again and Cancel', () => {
        beforeEach(() => {
          model.edit()
          model.info('different info')
          model.cancelEdit()
        })

        it('should set isEditing to false', () => {
          expect(model.isEditing()).toBeFalsy()
        })

        it('should set reset fields', () => {
          expect(model.info()).toEqual('Breakfast')
        })
      })
    })

    describe('Save with empty tags', () => {
      let stubbedApi = null

      beforeEach(() => {
        const fakeResolved = {
          then: function (success, error) {
            success({
              'statusCode': 200,
              'data': getData()
            })
          }
        }

        stubbedApi = sinon.stub(ajax, 'put').returns(fakeResolved)
        sinon.stub(getUrlParameter, 'parameter').returns('coffee4craig')

        model.tags('')

        model.save()
      })

      afterEach(() => {
        ajax.put.restore()
        getUrlParameter.parameter.restore()
      })

      it('should put service details with new to api', () => {
        var endpoint = endpoints.getServiceProviders + '/coffee4craig/services/569d2b468705432268b65c75'
        var payload = {
          'Info': 'Breakfast',
          'LocationDescription': undefined,
          'Tags': [],
          'OpeningTimes': [{
            'StartTime': '09:00',
            'EndTime': '10:00',
            'Day': 'Monday'
          }, {
            'StartTime': '09:00',
            'EndTime': '10:00',
            'Day': 'Tuesday'
          }],
          'Address': {
            'Street1': 'Booth Centre',
            'Street2': '',
            'Street3': 'Edward Holt House',
            'Street4': 'Pimblett Street',
            'City': 'Manchester',
            'Postcode': 'M3 1FU'
          }
        }

        var apiCalledWithExpectedArgs = stubbedApi.withArgs(endpoint, payload).calledOnce
        expect(apiCalledWithExpectedArgs).toBeTruthy()
      })
    })

    describe('Save Fail', () => {
      beforeEach(() => {
        const fakeResolved = {
          then: function (success, error) {
            success({
              'statusCode': 400,
              'data': {
                'messages': ['returned error message 1', 'returned error message 2']
              }
            })
          }
        }
        sinon.stub(browser, 'scrollTo')
        sinon.stub(ajax, 'put').returns(fakeResolved)
        sinon.stub(getUrlParameter, 'parameter').returns('coffee4craig')

        model.info('new info')

        model.save()
      })

      afterEach(() => {
        ajax.put.restore()
        browser.scrollTo.restore()
        getUrlParameter.parameter.restore()
      })

      it('should set message as joined error messages', () => {
        expect(model.errors()[0]).toEqual('returned error message 1')
        expect(model.errors()[1]).toEqual('returned error message 2')
      })

      it('should keep isEditing as true', () => {
        expect(model.isEditing()).toBeTruthy()
      })
    })
  })
})

function getData () {
  return {
    'serviceProviderId': 'coffee4craig',
    'key': '569d2b468705432268b65c75',
    'name': 'Meals',
    'info': 'Breakfast',
    'openingTimes': [{
      'startTime': '09:00',
      'endTime': '10:00',
      'day': 'Monday'
    }, {
      'startTime': '09:00',
      'endTime': '10:00',
      'day': 'Tuesday'
    }],
    'address': {
      'key': '7a6ff0f3-5b04-4bd9-b088-954e473358f5',
      'street': 'Booth Centre',
      'street1': null,
      'street2': 'Edward Holt House',
      'street3': 'Pimblett Street',
      'city': 'Manchester',
      'postcode': 'M3 1FU',
      'openingTimes': null
    },
    'tags': ['some tags']
  }
}
