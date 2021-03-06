const ko = require('knockout')

const ajax = require('../../ajax')
const browser = require('../../browser')
const endpoints = require('../../api-endpoints')
const htmlEncode = require('htmlencode')

const BaseViewModel = require('../BaseViewModel')

const Model = function () {
  const self = this

  self.itemCreated = ko.observable(false)
  self.title = ko.observable()
  self.body = ko.observable()
  self.tags = ko.observable()
  self.sortPosition = ko.observable()
  self.parentScenarios = ko.observableArray([])
  self.parentScenarioId = ko.observable()
  self.type = ko.observable()
  self.availableTypes = ko.observableArray(['advice', 'guides'])

  self.save = function () {
    browser.loading()
    const payload = {
      title: self.title(),
      type: self.type(),
      body: self.body(),
      tags: self.tags().length
        ? self.tags().split(',').map((t) => t.trim())
        : [],
      sortPosition: self.sortPosition(),
      parentScenarioId: self.parentScenarioId()
    }
    ajax
      .post(endpoints.contentPages, payload)
      .then((result) => {
        if (result.statusCode === 201) {
          self.clearErrors()
          self.itemCreated(true)
        } else {
          self.handleError(result)
        }
        browser.loaded()
      }, (err) => {
        self.handleError(err)
      })
  }

  self.init = function () {
    self.getParentScenarios()
  }

  self.getParentScenarios = () => {
    ajax
      .get(`${endpoints.parentScenarios}`)
      .then((result) => {
        self.parentScenarios(result.data
          .map(p => {
            return {
              id: p.id,
              name: htmlEncode.htmlDecode(p.name)
            }
          })
        )
      }, () => {
        self.handleServerError()
      })
  }
}

Model.prototype = new BaseViewModel()

module.exports = Model
