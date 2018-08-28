/**
 * PrivateLib object.
 */
'use strict'

/**
 * Import dependencies.
 */
const resolveHomeDir = require('expand-home-dir')
const exec = require('child_process').execSync
const Package = require('./package')
const path = require('path')
const fs = require('fs')

/**
 * PrivateLib class.
 * @class
 */
class PrivateLib {
  /**
   * Class constructor.
   * @param {Object} config
   * @param {String} rootPath
   * @constructor
   */
  constructor (config, rootPath) {
    this._setDefaults()
    this._setRootPath(rootPath)
    this._setSshConfig()
    this._setPackagesConfig(config)
  }

  /**
   * Set default options.
   * @private
   */
  _setDefaults () {
    this._projectKeysDir = null
    this._packagesConfig = {}
    this._sshConfigDir = null
    this._sshConfigPath = null
  }

  /**
   * Set root path option in object.
   * @param {String} rootPath
   * @private
   */
  _setRootPath (rootPath) {
    this._rootPath = rootPath
  }

  /**
   * Set packages data options to object.
   * @param {Object} config
   * @private
   */
  _setPackagesConfig (config) {
    this._projectKeysDir = path.join(this._rootPath, config.keys_dir)
    this._packagesConfig = config.packages
  }

  /**
   * Set user ssh config data.
   * @private
   */
  _setSshConfig () {
    this._sshConfigDir = this._getSshConfigDir()
    this._sshConfigPath = path.join(this._sshConfigDir, 'config')
  }

  /**
   * Get user system .ssh directory path.
   * @private
   * @returns {String}
   */
  _getSshConfigDir () {
    let dirPath = '~/.ssh'
    if (fs.existsSync(path.join(this._rootPath, '.sshlocation'))) {
      dirPath = fs.readFileSync(path.join(this._rootPath, '.sshlocation'), 'utf-8')
    }
    return resolveHomeDir(dirPath)
  }

  /**
   * Create dir if not exists.
   * @private
   */
  _prepareSshConfigDir () {
    if (!fs.existsSync(this._sshConfigDir)) {
      exec(`mkdir ${this._sshConfigDir} && chmod 700 ${this._sshConfigDir}`)
    }
  }

  /**
   * Create config file if not exists.
   * @private
   */
  _prepareSshConfigPath () {
    if (!fs.existsSync(this._sshConfigPath)) {
      exec(`echo -n > ${this._sshConfigPath} && chmod 600 ${this._sshConfigPath}`)
    }
  }

  /**
   * Prepare dirs and files.
   * @private
   */
  _prepare () {
    this._prepareSshConfigDir()
    this._prepareSshConfigPath()
  }

  /**
   * Create packages objects and each this.
   * @private
   */
  _eachPackages (cb) {
    for (let packageName in this._packagesConfig) {
      const packageObject = new Package({
        projectKeysDir: this._projectKeysDir,
        package: this._packagesConfig[packageName],
        sshConfigDir: this._sshConfigDir,
        sshConfigPath: this._sshConfigPath
      }, packageName)
      cb(packageObject)
    }
  }

  /**
   * Add all libraries keys.
   * @public
   */
  addKeys () {
    this._eachPackages(function (_pack) {
      _pack.add()
    })
  }

  /**
   * Remove all libraries keys.
   * @public
   */
  removeKeys () {
    this._eachPackages(function (_pack) {
      _pack.remove()
    })
  }
}

module.exports = PrivateLib
