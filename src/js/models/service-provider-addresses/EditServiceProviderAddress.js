var ajax = require('../../ajax')
var ko = require('knockout')
var Address = require('../Address')
var getUrlParameter = require('../../get-url-parameter')
var browser = require('../../browser')
var adminUrls = require('../../admin-urls')
var BaseViewModel = require('../BaseViewModel')

function EditServiceProviderAddress () {
  var self = this
  self.address = ko.observable()

  self.saveAddress = function (address) {
    browser.redirect(adminUrls.serviceProviders + '?key=' + getUrlParameter.parameter('providerId'))
  }

  self.init = function () {
    browser.loading()

    var endpoint = self.endpointBuilder
      .serviceProviders(getUrlParameter.parameter('providerId'))
      .addresses(getUrlParameter.parameter('addressId'))
      .build()
    ajax.get(endpoint)
      .then(function (result) {
        var address = new Address(result.data)
        address.addListener(self)
        self.address(address)
        browser.loaded()
      },
      function (error) {
        self.handleError(error)
      })
  }

  self.init()
}

EditServiceProviderAddress.prototype = new BaseViewModel()

module.exports = EditServiceProviderAddress
