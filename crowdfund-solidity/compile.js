const solc = require('solc')
const path = require('path')
const fs = require('fs')

const crowdfundPath = path.resolve(__dirname, 'contracts', 'Crowdfund.sol')
const sourceCode = fs.readFileSync(crowdfundPath, 'utf-8')
const compilerInput = {
  language: 'Solidity',
  sources: {
    'Crowdfund.sol': {
      content: sourceCode
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['*']
      }
    }
  }
}

const compiledCode = JSON.parse(solc.compile(JSON.stringify(compilerInput)))

module.exports = compiledCode.contracts['Crowdfund.sol'].Crowdfund
ß