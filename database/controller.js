const initDB = require('./connection.js')


const formatStartOfDay = (d) => {
    let dateTime = new Date(d)
    let Y = dateTime.getFullYear()
    let M = dateTime.getMonth() + 1
    let D = dateTime.getDate()
    let h = dateTime.getHours()
    let m = dateTime.getMinutes()
    let s = dateTime.getSeconds()
    M = checkTime(M)
    D = checkTime(D)
    h = checkTime(h)
    m = checkTime(m)
    s = checkTime(s)
    function checkTime (i) {
        if(i < 10) {
            return `0${i}`
        } else {
            return i
        }
    }
    dateTime = `${Y}-${M}-${D} ${h}:${m}:${s}`
    const [date] = dateTime.split(" ")
    return `${date} 00:00:00`
}

const formatEndOfDay = (d) => {
    let dateTime = new Date(d)
    let Y = dateTime.getFullYear()
    let M = dateTime.getMonth() + 1
    let D = dateTime.getDate()
    let h = dateTime.getHours()
    let m = dateTime.getMinutes()
    let s = dateTime.getSeconds()
    M = checkTime(M)
    D = checkTime(D)
    h = checkTime(h)
    m = checkTime(m)
    s = checkTime(s)
    function checkTime (i) {
        if(i < 10) {
            return `0${i}`
        } else {
            return i
        }
    }
    dateTime = `${Y}-${M}-${D} ${h}:${m}:${s}`
    const [date] = dateTime.split(" ")
    return `${date} 23:59:59`
}

exports.insertPrintDataLog = async (data) => {
    const db = await initDB()
    try {
        await db.run('INSERT INTO print_data_logs (data) VALUES (?)', [data])
    } catch (error) {
        console.log(error)
    } finally {
        await db.close()
    }
}

exports.insertPrintStatusLog = async (data) => {
    const db = await initDB()
    try {
        await db.run('INSERT INTO print_status_logs (data) VALUES (?)', [data])
    } catch (error) {
        console.log(error)
    } finally {
        await db.close()
    }
}

exports.insertPlcDataLog = async (data) => {
    const db = await initDB()
    try {
        await db.run('INSERT INTO plc_data_logs (data) VALUES (?)', [data])
    } catch (error) {
        console.log(error)
    } finally {
        await db.close()
    }
}

exports.insertPlcStatusLog = async (data) => {
    const db = await initDB()
    try {
        await db.run('INSERT INTO plc_status_logs (data) VALUES (?)', [data])
    } catch (error) {
        console.log(error)
    } finally {
        await db.close()
    }
}

exports.getLastPrintDataLog = async () => {
    const db = await initDB()

    try {
        const query = 'SELECT * FROM print_data_logs ORDER BY created_at DESC LIMIT 1'
        const row = await db.get(query)
        return row.data
    } catch (error) {
        console.log(error)   
    } finally {
        await db.close()
    }
}

exports.getPrintDataLog = async (payload) => {
    const startDate = formatStartOfDay(payload.query.start)
    const endDate = formatEndOfDay(payload.query.end)
    const currentPage = payload.query.page || 1
    const perPage = 10
    const limit = (currentPage - 1) * perPage
    const db = await initDB()
    try {
        const queryCount = `SELECT COUNT(*) AS count FROM print_data_logs WHERE created_at BETWEEN ? AND ?`
        const {count} = await db.get(queryCount, [startDate, endDate])
        const query = `
            SELECT * FROM print_data_logs
            WHERE created_at BETWEEN ? AND ?
            ORDER BY created_at DESC
            LIMIT ?
            OFFSET ?
        `
        const rows = await db.all(query, [startDate, endDate, perPage, limit])
        await db.close()
        const last_page = Math.ceil(count / perPage)
        const data = {
            data: rows,
            pages: {
                current_page: currentPage,
                last_page: last_page,
                totalItems: count
            }
        }
        return data
    } catch (error) {
        throw error
    }
}

exports.getPrintStatusLog = async (payload) => {
    const startDate = formatStartOfDay(payload.query.start)
    const endDate = formatEndOfDay(payload.query.end)
    const currentPage = payload.query.page || 1
    const perPage = 10
    const limit = (currentPage - 1) * perPage
    const db = await initDB()
    try {
        const queryCount = `SELECT COUNT(*) AS count FROM print_status_logs WHERE created_at BETWEEN ? AND ?`
        const {count} = await db.get(queryCount, [startDate, endDate])
        const query = `
            SELECT * FROM print_status_logs
            WHERE created_at BETWEEN ? AND ?
            ORDER BY created_at DESC
            LIMIT ?
            OFFSET ?
        `
        const rows = await db.all(query, [startDate, endDate, perPage, limit])
        await db.close()
        const last_page = Math.ceil(count / perPage)
        const data = {
            data: rows,
            pages: {
                current_page: currentPage,
                last_page: last_page,
                totalItems: count
            }
        }
        return data
    } catch (error) {
        throw error
    }
}

exports.getLastPlcDataLog = async () => {
    const db = await initDB()
    try {
        const query = 'SELECT data FROM plc_data_logs ORDER BY created_at DESC LIMIT 1'
        const row = await db.get(query)
        return row.data
    } catch (error) {
        console.log(error)   
    } finally {
        await db.close()
    }
}

exports.getPlcDataLog = async (payload) => {

    const startDate = formatStartOfDay(payload.query.start)
    const endDate = formatEndOfDay(payload.query.end)
    const currentPage = payload.query.page || 1
    const perPage = 10
    const limit = (currentPage - 1) * perPage
    const db = await initDB()
    try {
        const queryCount = `SELECT COUNT(*) AS count FROM plc_data_logs WHERE created_at BETWEEN ? AND ?`
        const {count} = await db.get(queryCount, [startDate, endDate])
        const query = `
            SELECT * FROM plc_data_logs
            WHERE created_at BETWEEN ? AND ?
            ORDER BY created_at DESC
            LIMIT ?
            OFFSET ?
        `
        const rows = await db.all(query, [startDate, endDate, perPage, limit])
        await db.close()
        const last_page = Math.ceil(count / perPage)
        const data = {
            data: rows,
            pages: {
                current_page: currentPage,
                last_page: last_page,
                totalItems: count
            }
        }
        return data
    } catch (error) {
        throw error
    }
}

exports.getPlcStatusLog = async (payload) => {
    const startDate = formatStartOfDay(payload.query.start)
    const endDate = formatEndOfDay(payload.query.end)
    const currentPage = payload.query.page || 1
    const perPage = 10
    const limit = (currentPage - 1) * perPage
    const db = await initDB()
    try {
        const queryCount = `SELECT COUNT(*) AS count FROM plc_status_logs WHERE created_at BETWEEN ? AND ?`
        const {count} = await db.get(queryCount, [startDate, endDate])
        const query = `
            SELECT * FROM plc_status_logs
            WHERE created_at BETWEEN ? AND ?
            ORDER BY created_at DESC
            LIMIT ?
            OFFSET ?
        `
        const rows = await db.all(query, [startDate, endDate, perPage, limit])
        await db.close()
        const last_page = Math.ceil(count / perPage)
        const data = {
            data: rows,
            pages: {
                current_page: currentPage,
                last_page: last_page,
                totalItems: count
            }
        }
        return data
    } catch (error) {
        throw error
    }
}

exports.getLastStatus = async () => {
    const db = await initDB()
    try {
        const queryPlc = `SELECT * FROM plc_status_logs ORDER BY created_at DESC LIMIT 1`
        const queryPrint = `SELECT * FROM print_status_logs ORDER BY created_at DESC LIMIT 1`
        const plc = await db.get(queryPlc)
        const print = await db.get(queryPrint)
        const data = {
            statusPlc: 'disconnected',
            datePlc: '--',
            statusPrint: 'disconnected',
            datePrint: '--'
        }
        if(plc) {
            data.statusPlc = plc.data.toLowerCase()
            data.datePlc = plc.created_at
        }
        if(print) {
            data.statusPrint = print.data.toLowerCase()
            data.datePrint = print.created_at
        }
        return data
    } catch (error) {
        console.log(error)
    }
}