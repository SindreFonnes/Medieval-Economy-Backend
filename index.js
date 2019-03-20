const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const wss = new WebSocket.Server({ port: 8888 });

let data = {}




function getDate(){
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth()+1; //January is 0!
    let yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    } 

    if(mm<10) {
        mm = '0'+mm
    } 

    return today = dd + '_' + mm + '_' + yyyy;
}

let today = getDate()

function saveToDataFile(func){
    fs.writeFile('data.JSON', JSON.stringify(data), 'utf8', (err) => {
        console.log(err)
        func();
    })

}


function readDataFile(func){
    fs.readFile('data.json', 'utf8', function readFileCallback(err, content){
        console.log('reading file');
        if(err){
            console.log(err);
        } else {
            data = JSON.parse(content);
            func();
        }
    })
}


function makeBackupFile(func){
    fs.writeFile(path.resolve(__dirname,"./backup/",today+"_backup.json"), JSON.stringify(data), function (err) {
        if(err) throw err;
        console.log('Saved!');
        func();
    })
}


wss.on('connection', function connection(ws) {

    function sendData(message){
        ws.send(JSON.stringify(message))
    }

    ws.on('message', function incoming(text) {
  
        let message = JSON.parse(text)
        if (message.type === 0){
            console.log(message.content)
        }
        if(message.type === 1){
            //end turn
            data = message.content
            console.log("Data recived!")
        }
        if(message.type === 2){
            //data sync
            data = message.content            
            saveToDataFile(() => {
                console.log("Data synced!")
            })
        }
        if(message.type === 3){
            //fetch data
            readDataFile(() => {
                let response = {
                    type: 0,
                    content: data
                }
                sendData(response)
                console.log('Save data sent!')
            });
        }
        if(message.type === 4){
            makeBackupFile(() => {
                console.log('Backupfile made!')
            })
        }
        
  });


  let init = {
      type: 10,
      content: "Connection confirmed"
  }
  sendData(init);
});

console.log('Server is listening at port: 8888')
readDataFile(() => {})
