'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  BASE_API: '"http://localhost/"',
  OSS_PATH: '"https://zxktest.oss-cn-shenzhen.aliyuncs.com"'
})
