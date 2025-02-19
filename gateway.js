const { Controller, Tag, TagGroup } = require('ethernet-ip')
const net = require('net')
const eventPublish = require('./event.js')
const { getLastPlcDataLog, getLastPrintDataLog, insertPlcDataLog, insertPrintDataLog, insertPrintStatusLog, insertPlcStatusLog } = require('./database/controller.js')

const PLC = new Controller()

const PRINT_SERVER_HOST = '10.203.179.133'
const PRINT_SERVER_PORT = '2345'
const PLC_IP = '10.203.179.200'
const POLLING_INTERVAL = 1000
const NUM_TAG = 8

const tagGroup = new TagGroup();
const stringTags = []
let previousPrintData, previousPlcData, dataToPrint

const stratGateway = async () => {
    previousPrintData = await getLastPrintDataLog()
    previousPlcData = await getLastPlcDataLog()
    let tagId = 0
    for(let i = 0; i < NUM_TAG; i++) {
        const line = i+1
        const tagData = []
        if(line % 2) {
            tagId ++
            const tagName = `Filler_SPLine0${tagId}.CTX_SKUID`
            const tagLen = new Tag(`${tagName}.LEN`)
            for(let j = 0; j < 10; j++) {
                const dataTag = new Tag(`${tagName}.DATA[${j}]`)
                tagGroup.add(dataTag)
                tagData.push(dataTag)
            }
            tagGroup.add(tagLen)
            stringTags.push({tagName, tagLen, tagData})
        } else {
            const tagName = `Filler_SPLine0${tagId}.CTX_Batch_no`
            const tagLen = new Tag(`${tagName}.LEN`)
            for(let j = 0; j < 10; j++) {
                const dataTag = new Tag(`${tagName}.DATA[${j}]`)
                tagGroup.add(dataTag)
                tagData.push(dataTag)
            }
            tagGroup.add(tagLen)
            stringTags.push({tagName, tagLen, tagData})
        }
    }

    let pollCount = 0
    const readStringTags = async () => {
        try {
            await PLC.readTagGroup(tagGroup)
            // console.log('polling string: ' + pollCount++)
            const resultString = []
            for(const tag of stringTags) {
                const length = tag.tagLen.value
                const stringData = []
    
                for(let i = 0; i < length; i++) {
                    stringData.push(String.fromCharCode(tag.tagData[i].value))
                }
                const stringValue = stringData.join("")
                if(stringValue && stringValue != 0) {
                    resultString.push(stringValue)
                } else {
                    resultString.push("0")   
                }
    
            }
            
            return resultString.join(";")
        } catch (error) {
            console.log('error during batch read : ' + error )
            insertPlcStatusLog('Disconnected')
        }
    }
    
    dataToPrint = ''
    const pollAllStrings = async () => {
        while(true) {
            const data = await readStringTags()
            dataToPrint = data
            eventPublish.emit('plc-counter')
            if(previousPlcData !== dataToPrint) {
                previousPlcData = dataToPrint
                await insertPlcDataLog(dataToPrint)
                eventPublish.emit('plc-change')
            }
            await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL))
        }
    }
    
    const connectToPrintServer = () => {
        const client = new net.Socket()
        client.connect(PRINT_SERVER_PORT, PRINT_SERVER_HOST, async() => {
            console.log('Connected to print sever')
            await insertPrintStatusLog('Connected')
            eventPublish.emit('print-status', 'connected')
            setInterval(async () => {
                if(dataToPrint) {
                    client.write(dataToPrint)
                    eventPublish.emit('print-counter', 'send')
                    if(previousPrintData !== dataToPrint) {
                        previousPrintData = dataToPrint
                        await insertPrintDataLog(dataToPrint)
                        eventPublish.emit('print-change')
                    }
                }
            }, 10000)
    
        })
        
        client.on("close", async () => {
            console.log('TCP client reconnecting....')
            eventPublish.emit('print-status', 'reconnecting')
            await insertPrintStatusLog('Reconnecting')
            setTimeout(connectToPrintServer, 5000)
        })
    
        client.on('error', async (err) => {
            console.log('TCP client error: ' +err)
            eventPublish.emit('print-status', 'disconnected')
            await insertPrintStatusLog('Disconnected')
            client.destroy()
        })
    }
    
    const connectToPLC = () => {
        PLC.connect(PLC_IP, 0)
        .then(async () => {
            console.log('PLC is connected')
            await insertPlcStatusLog('Connected')
            eventPublish.emit('plc-status', 'connected')
            pollAllStrings()
        })
        .catch(async (err) => {
            console.log('Error connecting to PLC ' + err)
            await insertPlcStatusLog('Disconnected')
            eventPublish.emit('plc-status', 'disconnected')
        })
    }
    connectToPLC()
    connectToPrintServer()
}

module.exports = stratGateway