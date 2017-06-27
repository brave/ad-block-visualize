const fs = require('fs')
const path = require('path')
const getCreds = () => {
  return new Promise((resolve, reject) => {
    const homeDir = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'];
    const credentialsPath = path.join(homeDir, '.plotly', '.credentials')
    fs.readFile(credentialsPath, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(JSON.parse(data))
    })
  })
}

const newPlotly = () =>
  getCreds().then((creds) => {
    return require('plotly')(creds.username, creds.api_key)
  })

const plot = (plotly, data, layout) => {
  return new Promise((resolve, reject) => {
    plotly.plot(data, layout, function (err, msg) {
      if (err) {
        console.error(err)
        reject(err)
        return
      }
      console.log(msg)
      resolve(msg)
    })
  })
}

module.exports = {
  getCreds,
  newPlotly,
  plot,
}

