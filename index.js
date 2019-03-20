const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const endturnfile = require('./endturn')

const wss = new WebSocket.Server({ port: 8888 });

let data = {}
let log = []

function getDate() {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1; //January is 0!
    let yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    return today = dd + '_' + mm + '_' + yyyy;
}

let today = getDate()

function saveToDataFile(func) {
    fs.writeFile('data.JSON', JSON.stringify(data), 'utf8', (err) => {
        console.log(err)
        func();
    })
    fs.writeFile('log.JSON', JSON.stringify(log), 'utf8', (err) => {
        console.log(err)
        func();
    })
}

function readDataFile(func) {
    console.log('reading file');
    fs.readFile('data.json', 'utf8', function readFileCallback(err, content) {
        if (err) {
            console.log(err);
        } else {
            data = JSON.parse(content);
            func();
        }
    })
    fs.readFile('log.json', 'utf8', function readFileCallback(err, content) {
        if (err) {
            console.log(err);
        } else {
            log = JSON.parse(content);
            func();
        }
    })
}

function makeBackupFile(func) {
    fs.writeFile(path.resolve(__dirname, "./backup/", today + "_backup.json"), JSON.stringify(data), function (err) {
        if (err) throw err;
        func();
    })
    fs.writeFile(path.resolve(__dirname, "./backup/", today + "_log.json"), JSON.stringify(log), function (err) {
        if (err) throw err;
        
        func();
    })
    console.log('Saved!');
}

wss.on('connection', function connection(ws) {

    function sendData(message) {
        ws.send(JSON.stringify(message))
    }

    ws.on('message', function incoming(text) {
        let message;
        try {
            message = JSON.parse(text)
        } catch (err) {
            console.log(err)
        }

        if (message.type === 0) {
            console.log(message.content)
        }

        if (message.type === 1) {
            //end turn
            data = message.content
            data = endturnfile.endturn(message.days,data, ()=>{
                console.log('Ended turn, ' + message.days + ' days have passed.')
            })
            let date = new Date();
            log.push('Ended turn, ' + message.days + ' days have passed.; time: ' + date)
            saveToDataFile()
            let response = {
                type: 0,
                content: [
                    data,
                    log
                ]
            }
            sendData(response)
            
        }

        if (message.type === 2) {
            //data sync
            data = message.content
            saveToDataFile(() => {
                console.log("Data synced!")
            })
        }

        if (message.type === 3) {
            //fetch data
            readDataFile(() => {
                let response = {
                    type: 0,
                    content: [
                        data,
                        log
                    ]
                }
                sendData(response)
                console.log('Save data sent!')
            });
        }

        if (message.type === 4) {
            makeBackupFile(() => {
                console.log('Backupfile made!')
            })
        }
    });

    readDataFile(() => {
        let response = {
            type: 0,
            content: [
                data,
                log
            ]
        }
        sendData(response)
        console.log('Save data sent!')
    });
});

console.log('Server is listening at port: 8888')
readDataFile(() => { })
