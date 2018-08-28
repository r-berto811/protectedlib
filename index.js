
/**
 * Private lib initializator.
 */
'use strict'

/**
 * Import dependencies.
 */
const fs = require('fs')
const path = require('path')
const PrivateLib = require('./lib/private_lib')
const rootPath = path.resolve(__dirname, '../../')

module.exports = {
  /**
   * Validate custom package config.
   * @param {String} packageName
   * @param {Object} config
   */
  _validatePackageConfig (packageName, config) {
    if (!config.host) {
      throw new Error(`"host" is required parameter of ${packageName} config`)
    }
    if (!config.key_file) {
      throw new Error(`"key_file" is required parameter of ${packageName} config`)
    }
  },
  /**
   * Validate main config.
   * @param {Object} config
   */
  _validateConfig (config) {
    if (typeof config !== 'object') {
      throw new Error('Config must be a valid object')
    }
    if (!config.keys_dir) {
      throw new Error('"keys_dir" is required parameter')
    }
    if (!config.packages) {
      throw new Error('"packages" is required parameter')
    }
    if (typeof config.packages !== 'object') {
      throw new Error('"packages" parameter must be a valid object')
    }
    for (let packageName in config.packages) {
      this._validatePackageConfig(packageName, config.packages[packageName])
    }
  },
  /**
   * Get config from options or load from file..
   * @param {Object|undefined} config 
   */
  _preprocessConfig (config) {
    if (!config) {
      if (!fs.existsSync(path.join(rootPath, 'protected.json'))) {
        throw new Error('File "protected.json" is not found in project root')
      }
      config = JSON.parse(fs.readFileSync(path.join(rootPath, 'protected.json'), 'utf-8'))
    }
    this._validateConfig(config)
    return config
  },
  /**
   * Init and return new PrivateLib instance.
   * @param {Object} config
   */
  init (config) {
    config = this._preprocessConfig(config)
    return new PrivateLib(config, rootPath)
  }
}
