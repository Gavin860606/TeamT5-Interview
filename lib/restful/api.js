import { campus_rec } from '../mysql/model/campus_record.js'
import { meter_log } from '../mysql/model/meter_log.js'
import { daily_energy } from '../mysql/model/daily_energy.js'
import { monthly_energy } from '../mysql/model/monthly_energy.js'
import moment from 'moment'
import Op from 'sequelize/lib/operators.js'
import { csv } from '../csv/csv.js'
// import { or } from 'sequelize/lib/sequelize'
import { sequelize } from '../mysql/connection.js'
import mysql from 'mysql'

moment.tz.setDefault('Asia/Taipei')

const connection = mysql.createConnection({
    host: 'mypenghu.mysql.database.azure.com',
    user: 'taadmin@mypenghu',
    password: 'ecs@1oT!',
    database: 'junyidb',
    ssl: {
        rejectUnauthorized: false,
    },
})
connection.connect()

export const getRecord = async (req, res, next) => {
    try {
        const getRecord = await campus_rec.findAll({
            attributes: ['id', 'name', 'power', 'day_energy'],
        })
        res.json(getRecord)
    } catch (error) {
        next(error)
    }
}

export const downloadCSV = async (req, res, next) => {
    const startDate = moment(req.params.startDate).startOf('day').format('YYYY-MM-DD HH:mm:ss')
    const endDate = moment(req.params.endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')
    try {
        //效能問題所以不使用Sequalize ORM架構，改用原生Mysql
        const sql = `SELECT meter_id, log_time, log_date, log_datetime, freq, v_a, v_b, v_c, v_ab, v_bc, v_ca, i_a, i_b, i_c, p_a, p_b, p_c, p_con, p_tot, pf_a, pf_b, pf_c, pf_tot, pf_avg, ep_imp, tot FROM meter_log AS meter_log WHERE minute(meter_log.log_time) in ( 0, 15,30,45) AND meter_log.log_date BETWEEN '${startDate}' AND '${endDate}'  ORDER BY meter_log.meter_id ASC, meter_log.log_date DESC, meter_log.log_time DESC`
        console.log(sql)
        connection.query(sql, function (error, results, fields) {
            if (error) throw error
            console.log(results)
            csv(results, req, res)
        })
    } catch (error) {
        next(error)
    }
}
export const dailyReport = async (req, res, next) => {
    const typeof_meterIds = req.query.meterIds
    const date = req.params.date
    let meterIds = []

    const startDate = moment(date).startOf('day').format('YYYY-MM-DD HH:mm:ss')
    const endDate = moment(date).endOf('day').format('YYYY-MM-DD HH:mm:ss')

    if (typeof typeof_meterIds === 'string') {
        meterIds.push(req.query.meterIds)
    } else {
        meterIds = req.query.meterIds
    }
    try {
        const sql = `SELECT meter_id, log_time, log_date, ep_imp, tot FROM meter_log AS meter_log WHERE minute(meter_log.log_time) in ( 0, 15,30,45) AND meter_log.log_date BETWEEN '${startDate}' AND '${endDate}'  ORDER BY meter_log.meter_id ASC, meter_log.log_date ASC, meter_log.log_time ASC`
        connection.query(sql, meterIds, function (error, results, fields) {
            if (error) throw error
            const dailyReport = results
            console.log(results)
            //將每一電表分開
            const filterDailyReport = {}
            meterIds.forEach((id) => {
                filterDailyReport[id] = dailyReport.filter((item) => item.meter_id === parseInt(id, 10))
            })
            res.json(filterDailyReport)
        })
        // const dailyReport = await meter_log.findAll({
        //     where: {
        //         meter_id: {
        //             [Op.or]: meterIds,
        //         },

        //         log_date: {
        //             [Op.between]: [moment(date).startOf('day').toDate(), moment(date).endOf('day').toDate()],
        //         },
        //         [Op.or]: [
        //             { log_time: { [Op.like]: '%:00:00' } },
        //             { log_time: { [Op.like]: '%:15:00' } },
        //             { log_time: { [Op.like]: '%:30:00' } },
        //             { log_time: { [Op.like]: '%:45:00' } },
        //         ],
        //     },
        //     attributes: ['meter_id', 'log_time', 'log_date', 'ep_imp', 'tot'],
        //     order: [
        //         ['meter_id', 'ASC'],
        //         ['log_date', 'ASC'],
        //         ['log_time', 'ASC'],
        //     ],
        // })
        // console.log(dailyReport)
        // //將每一電表分開
        // const filterDailyReport = {}
        // meterIds.forEach((id) => {
        //     filterDailyReport[id] = dailyReport.filter((item) => item.dataValues.meter_id === parseInt(id, 10))
        // })
        // res.json(filterDailyReport)
    } catch (error) {
        next(error)
    }
}
export const monthlyReport = async (req, res, next) => {
    const typeof_meterIds = req.query.meterIds
    // const meterIds = req.body.meterIds
    const month = req.params.month
    let meterIds = []
    if (typeof typeof_meterIds === 'string') {
        meterIds.push(req.query.meterIds)
    } else {
        meterIds = req.query.meterIds
    }
    try {
        const monthlyReport = await daily_energy.findAll({
            where: {
                meter_id: {
                    [Op.or]: meterIds,
                },
                log_date: {
                    [Op.between]: [moment(month).startOf('month').toDate(), moment(month).endOf('month').toDate()],
                },
            },

            attributes: ['meter_id', 'log_date', 'energy'],
            order: [
                ['meter_id', 'ASC'],
                ['log_date', 'ASC'],
            ],
        })
        const filterMonthlyReport = {}
        meterIds.forEach((id) => {
            filterMonthlyReport[id] = monthlyReport.filter((item) => item.dataValues.meter_id === parseInt(id, 10))
        })
        res.json(filterMonthlyReport)
    } catch (error) {
        next(error)
    }
}
export const annualReport = async (req, res, next) => {
    const typeof_meterIds = req.query.meterIds
    // const meterIds = req.body.meterIds
    const year = req.params.year
    let meterIds = []
    if (typeof typeof_meterIds === 'string') {
        meterIds.push(req.query.meterIds)
    } else {
        meterIds = req.query.meterIds
    }

    try {
        const annualReport = await monthly_energy.findAll({
            where: {
                meter_id: {
                    [Op.or]: meterIds,
                },
                year: year,
            },
            attributes: ['meter_id', 'month', 'energy'],
            order: [
                ['meter_id', 'ASC'],
                ['month', 'ASC'],
            ],
        })
        const filterMonthlyReport = {}
        meterIds.forEach((id) => {
            filterMonthlyReport[id] = annualReport.filter((item) => item.dataValues.meter_id === parseInt(id, 10))
        })
        res.json(filterMonthlyReport)
    } catch (error) {
        next(error)
    }
}
