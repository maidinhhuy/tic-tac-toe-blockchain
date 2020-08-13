'use strict'

const loadConfig = (defaultValid = {}) => {
  try {
    return require('..config.json')
  } catch (err) {
    if (err instanceof SyntaxError) throw err
    return {}
  }
}

const config = loadConfig()

const initConfigValue = (key, defaultValue = null) => {
  config[key] = process.env[key] || config[key] || defaultValue
}

// Setup non-sensitive config variable with sensitive defaults
// if not set in environment variables or config.json
initConfigValue('RETRY_WAIT', 5000)
initConfigValue('VALIDATOR_URL', 'tcp://localhost:4004')
initConfigValue('DB_HOST', 'localhost')
initConfigValue('DB_PORT', 28015)
initConfigValue('DB_NAME', 'xo')

module.exports = config