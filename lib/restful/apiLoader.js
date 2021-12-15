import * as apis from './api.js'

const loader = (app) => {
    app.get('/junyi/getRecord', apis.getRecord)
    app.get('/junyi/downloadCSV/:startDate/:endDate', apis.downloadCSV)
    app.get('/junyi/dailyReport/:date', apis.dailyReport)
    app.get('/junyi/monthlyReport/:month', apis.monthlyReport)
    app.get('/junyi/annualReport/:year', apis.annualReport)
}

export default loader
