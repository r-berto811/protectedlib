/**
 * Package object.
 */
'use strict'

/**
 * Import dependencies.
 */
const exec = require('child_process').execSync
const path = require('path')
const fs = require('fs')

/**
 * Package item class.
 * @class
 */
class Package {
  /**
   * Package constructor.
   * @param {Object} config
   * @param {String} packageName
   * @constructor
   */
  constructor (config, packageName) {
    this._package = packageName
    this._config = config
    this._setDefaults()
    this._setData()
    this._checkKeyPath()
  }

  /**
   * Set default options.
   * @private
   */
  _setDefaults () {
    this._projectKeyPath = null
    this._sshConfigDir = null
    this._sshConfigPath = null
    this._sshConfigKeyPath = null
  }

  /**
   * Set data options.
   * @private
   */
  _setData () {
    this._sshConfigDir = this._config.sshConfigDir
    this._sshConfigPath = this._config.sshConfigPath
    this._projectKeyPath = path.join(this._config.projectKeysDir, this._config.package.key_file)
    this._sshConfigKeyPath = path.join(this._sshConfigDir, this._config.package.key_file)
    this._host = this._config.package.host
  }

  /**
   * Check if private key exists in project.
   * @private
   */
  _checkKeyPath () {
    if (!fs.existsSync(this._projectKeyPath)) {
      throw new Error(`Not found file: '${this._projectKeyPath}'`)
    }
  }

  /**
   * Generate part of options file associated with current package.
   * @private
   */
  _getConfigStr () {
    return `Host ${this._host}\n  IdentityFile ${this._sshConfigKeyPath}\n  IdentitiesOnly yes\n  StrictHostKeyChecking no\n`
  }

  /**
   * Check if package config exists in system config.
   * @private
   */
  _checkExistsConfig () {
    const data = fs.readFileSync(this._sshConfigPath, 'utf8')
    return data.indexOf(this._getConfigStr()) > -1
  }

  /**
   * Add package config to system config.
   * @private
   */
  _addToConfig () {
    fs.appendFileSync(this._sshConfigPath, this._getConfigStr())
  }

  /**
   * Remove package config from system config.
   * @private
   */
  _removeFromConfig () {
    let data = fs.readFileSync(this._sshConfigPath, 'utf8')
    data = data.replace(this._getConfigStr(), '')
    fs.writeFileSync(this._sshConfigPath, data)
  }

  /**
   * Check if exists private key in system folder.
   * @private
   */
  _checkExistsKey () {
    return fs.existsSync(this._sshConfigKeyPath)
  }

  /**
   * Create empty file to private key in system folder.
   * @private
   */
  _prepareSshConfigKeyPath () {
    if (!this._checkExistsKey()) {
      exec(`echo -n > ${this._sshConfigKeyPath} && chmod 600 ${this._sshConfigKeyPath}`)
    }
  }

  /**
   * Add package private key to system folder.
   * @private
   */
  _addKey () {
    const key = fs.readFileSync(this._projectKeyPath, 'utf8')
    fs.writeFileSync(this._sshConfigKeyPath, key)
  }

  /**
   * Remove package private key from system folder.
   * @private
   */
  _removeKey () {
    if (this._checkExistsKey()) {
      exec(`rm ${this._sshConfigKeyPath}`)
    }
  }

  /**
   * Check if exists key in system dir.
   * @public
   */
  exists () {
    return this._checkExistsKey && this._checkExistsConfig
  }

  /**
   * Add config.
   * @public
   */
  add () {
    this._addToConfig()
    this._addKey()
  }

  /**
   * Remove config.
   * @public
   */
  remove () {
    this._removeFromConfig()
    this._removeKey()
  }
}

module.exports = Package
