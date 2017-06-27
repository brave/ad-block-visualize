const {newPlotly, plot} = require('./lib/util')
const path = require('path')
const {makeAdBlockClientFromFilePath} = require('ad-block/lib/util')

const filterTypes = ['filters', 'cosmeticFilters', 'htmlFilters', 'exceptionFilters', 'noFingerprintFilters', 'noFingerprintExceptionFilters']
const filterTypeValues = []
const domainListInfo = {
  noDomainList: 0,
  domainListOnly: 0,
  antiDomainListOnly: 0,
  mixedDomainList: 0
}
const byTypeDomainListInfo = filterTypes.reduce((result, filterType) => {
  result[filterType] = Object.assign({}, domainListInfo)
  return result
}, {})

const testLists = [
  './test/data/easylist.txt',
  'test/data/easyprivacy.txt',
  './test/data/ublock-unbreak.txt',
  './test/data/brave-unbreak.txt'
].map((relPath) => path.resolve(require.resolve('ad-block'), '..', '..', '..', relPath))

const p = makeAdBlockClientFromFilePath(testLists)
p.then((adBlockClient) => {
  filterTypes.forEach((filterType) => {
    const filters = adBlockClient.getFilters(filterType)
    filterTypeValues.push(filters.length)
    filters.forEach((filter) => {
      if (filter.domainList.length === 0 && filter.antiDomainList.length === 0) {
        domainListInfo.noDomainList++
        byTypeDomainListInfo[filterType].noDomainList++
      } else if (filter.domainList.length > 0 && filter.antiDomainList.length === 0) {
        domainListInfo.domainListOnly++
        byTypeDomainListInfo[filterType].domainListOnly++
      } else if (filter.domainList.length === 0 && filter.antiDomainList.length > 0) {
        domainListInfo.antiDomainListOnly++
        byTypeDomainListInfo[filterType].antiDomainListOnly++
      } else {
        domainListInfo.mixedDomainList++
        byTypeDomainListInfo[filterType].mixedDomainList++
      }
    })
  })
}).then(() => {
  return newPlotly()
}).then((plotly) => {
  const filterTypeData = [{
    labels: filterTypes,
    values: filterTypeValues,
    type: 'pie',
    pull: [0, 0, 0, 0, 0.2, 0.2]
  }]
  const domainLisetData = [{
    name: 'All',
    textposition: 'inside',
    hole: 0.4,
    labels: Object.keys(domainListInfo),
    values: Object.values(domainListInfo),
    type: 'pie',
    domain: {
      y: [0.68, 1],
      x: [0, 1]
    }
  }, {
    name: 'No NP',
    textposition: 'inside',
    hole: 0.4,
    labels: Object.keys(byTypeDomainListInfo['noFingerprintFilters']),
    values: Object.values(byTypeDomainListInfo['noFingerprintFilters']),
    type: 'pie',
    domain: {
      y: [0.34, 0.66],
      x: [0, 0.45]
    }
  }, {
    name: 'No FP Excep.',
    textposition: 'inside',
    hole: 0.4,
    labels: Object.keys(byTypeDomainListInfo['noFingerprintExceptionFilters']),
    values: Object.values(byTypeDomainListInfo['noFingerprintExceptionFilters']),
    type: 'pie',
    domain: {
      y: [0.34, 0.66],
      x: [0.55, 1]
    }
  }, {
    name: 'Filters',
    textposition: 'inside',
    hole: 0.4,
    labels: Object.keys(byTypeDomainListInfo['filters']),
    values: Object.values(byTypeDomainListInfo['filters']),
    type: 'pie',
    domain: {
      y: [0, 0.32],
      x: [0, 0.45]
    }
  }, {
    name: 'Excep. Filters',
    textposition: 'inside',
    hole: 0.4,
    labels: Object.keys(byTypeDomainListInfo['exceptionFilters']),
    values: Object.values(byTypeDomainListInfo['exceptionFilters']),
    type: 'pie',
    domain: {
      y: [0, 0.32],
      x: [0.55, 1]
    }
  }]
  const layout = {
    fileopt: 'overwrite'
  }
  Promise.all([
    plot(plotly, domainLisetData, Object.assign(layout, { filename: 'domainInfo.png', title: 'Domain Info' })),
    plot(plotly, filterTypeData, Object.assign(layout, { filename: 'filterTypes.png', title: 'Filter types' }))
  ])
}).catch((e) => {
  console.error(e)
})
