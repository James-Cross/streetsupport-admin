import ajax from '../../ajax'
import adminUrls from '../../admin-urls'
import browser from '../../browser'
import cookies from '../../cookies'
import BaseViewModel from '../BaseViewModel'
import endpoints from '../../api-endpoints'
import querystring from '../../get-url-parameter'
import ko from 'knockout'

const Model = function () {
  const self = this
  self.categories = ko.observableArray()
  self.isSubmitted = ko.observable(false)
  self.isSuccessful = ko.observable(false)

  const dataReceived = () => {
    if (self.allCategories === undefined ||
        self.providerCategories === undefined) return

    self.categories((self.allCategories().map((c) => {
      return {
        key: c.key,
        value: c.value,
        isChecked: ko.observable(self.providerCategories.indexOf(c.key) >= 0)
      }
    })))

    browser.loaded()
  }

  const getCategories = () => {
    ajax
      .get(endpoints.needCategories)
      .then((result) => {
        const sorted = result.data
          .sort((a, b) => {
            if (a.value > b.value) return 1
            if (a.value < b.value) return -1
            return 0
          })
        self.allCategories = ko.observableArray(sorted)
        dataReceived()
      }, (_) => {
        browser.redirect('/500')
      })
  }

  const getProvider = (providerId) => {
    const providerEndpoint = endpoints.getServiceProviders + '/' + providerId
    ajax
      .get(providerEndpoint)
      .then((result) => {
        self.providerCategories = ko.observableArray(result.data.needCategories)
        dataReceived()
      }, (_) => {
        browser.redirect('/500')
      })
  }

  self.save = () => {
    browser.loading()
    const providerId = querystring.parameter('providerId')
    const endpoint = endpoints.getServiceProviders + '/' + providerId + '/needs/categories'
    const payload = self.categories()
      .filter((c) => c.isChecked())
      .map((c) => c.key)
    ajax.put(endpoint, payload)
      .then((result) => {
        self.isSubmitted(true)
        self.isSuccessful(true)
        browser.loaded()
      }, (_) => {
        browser.redirect('/500')
      })
  }

  self.init = () => {
    browser.loading()
    const providerId = querystring.parameter('providerId')
    getCategories()
    getProvider(providerId)
    self.backUrl = ko.observable(adminUrls.serviceProviders + '?key=' + providerId)
  }

  self.init()
}

Model.prototype = new BaseViewModel()

module.exports = Model
