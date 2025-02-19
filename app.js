const express = require('express')
const path = require('path')
const { createServer } = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const migrateTable = require('./database/migrate.js')
const stratGateway =  require('./gateway.js')
const eventPublish = require('./event.js')
const { getLastStatus, getPlcDataLog, getPlcStatusLog, getPrintDataLog, getPrintStatusLog } = require('./database/controller.js')

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['*']
    }
})


io.on('connection', async (socket) => {
    const data = await getLastStatus()
    let raw
    socket.emit('mounted', data)
    const onPlcStatus = async () => {
        raw = await getLastStatus()
        socket.emit('plc-status', raw)
    }
    const onPlcCounter = () => {
        socket.emit('plc-counter')
    }
    const onPlcChange = () => {
        socket.emit('plc-change')
    }
    const onPrintStatus = async (msg) => {
        raw = await getLastStatus()
        socket.emit('print-status', raw)
    }
    const onPrintCounter = (msg) => {
        socket.emit('print-counter', msg)
    }
    const onPrintChange = () => {
        socket.emit('print-change')
    }
    eventPublish.on('plc-status', onPlcStatus)
    eventPublish.on('plc-change', onPlcChange)
    eventPublish.on('plc-counter', onPlcCounter)
    eventPublish.on('print-change', onPrintChange)
    eventPublish.on('print-status', onPrintStatus)
    eventPublish.on('print-counter', onPrintCounter)
    socket.on('disconnect', () => {
        eventPublish.off('plc-status', onPlcStatus)
        eventPublish.off('plc-change', onPlcChange)
        eventPublish.off('plc-counter', onPlcCounter)
        eventPublish.off('print-change', onPrintChange)
        eventPublish.off('print-status', onPrintStatus)
        eventPublish.off('print-counter', onPrintCounter)
    })
})

app.use(cors())
app.use(express.json())
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));
app.get('/', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
})

app.get('/plc-data', async (req, res) => {
   const data = await getPlcDataLog(req)
   res.status(200).json(data)
})
app.get('/plc-status', async (req, res) => {
    const data = await getPlcStatusLog(req)
    res.status(200).json(data)
})

app.get('/print-data', async (req, res) => {
    const data = await getPrintDataLog(req)
    res.status(200).json(data)
})

app.get('/print-status', async (req, res) => {
    const data = await getPrintStatusLog(req)
    res.status(200).json(data)
})


const PORT = 1000
httpServer.listen(PORT, async () => {
    await migrateTable()
    // await insertPrintDataLog('0;0;123;2343')
    // await insertPrintDataLog('1234;12345678910;1234;12345678910;1234;12345678910;1234;12345678910')
    stratGateway()
    console.log('app runing on port: '+PORT)
})
