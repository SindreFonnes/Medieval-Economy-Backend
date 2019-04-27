function endturn(days, data, func){
    for(let i = 0; i<days; i++){
        data.money += MoneyChangeFromCitizenProfessions(data)
        data.money += TaskExpenses(data)
        data = AddWaresGainedFromTasks(data)
        data.date ++;
        data = ProgressOnBuildingTasks(data)
    }
    func();
    return data;
}

function MoneyChangeFromCitizenProfessions(data){
    let money = 0;
    for(let i = 0; i<data.citizens.length; i++){
        if(data.citizens[i].task != "") {
            if(0 < data.professions.find(t => t.id == data.citizens[i].profession).revenueorupkeep) {
                money += data.professions.find(t => t.id == data.citizens[i].profession).revenueorupkeep*data.taxrate
            } else {
                money += data.professions.find(t => t.id == data.citizens[i].profession).revenueorupkeep
            }
        }
    }
    return money;
}

function TaskExpenses(data) {
    let money = 0;
    
    for(let i = 0; i< data.tasks.length; i++){
        if(data.tasks[i].hasrevenueorupkeep) {
            money += data.tasks[i].workers.length * data.tasks[i].revenueorupkeep
        } 
    }
    
    return money;
}

function AddWaresGainedFromTasks(data){
    for(let i = 0; i<data.tasks.length; i++){
        if(data.tasks[i].type == 0&&data.tasks[i].gainwares) {
            if(data.resources.find(t => t.id === data.tasks[i].resourceexploited).isfiniteresource) {
                data.wares.find(t => t.id == data.resources.find(j => j.id === data.tasks[i].resourceexploited).warewhenexploited).amountowned += data.tasks[i].productionperworker * data.tasks[i].workers.length*data.tasks[i].efficency
                data.resources.find(t => t.id === data.tasks[i].resourceexploited).resourceamount -= data.tasks[i].productionperworker * data.tasks[i].workers.length
                if(data.resources.find(t => t.id === data.tasks[i].resourceexploited).resourceamount < 0){
                    data.wares.find(t => t.id == data.resources.find(j => j.id === data.tasks[i].resourceexploited).warewhenexploited).amountowned += data.resources.find(t => t.id === data.tasks[i].resourceexploited).resourceamount*data.tasks[i].efficency
                    data.citizens.find(t => t.task == data.tasks[i].id).task = "";
                    let tmp = data.tasks[i].id
                    data.tasks = data.tasks.filter(t => t.id != tmp)
                    data.resources = data.resources.filter(t => t.id != data.tasks[i].resourceexploited)
                }
            }
        }
        if(data.tasks[i].type == 3&&data.tasks[i].gainwares) {
            console.log('yes')
            console.log(data.tasks[i].productionperworker + ' ' + data.tasks[i].workers.length + ' ' + data.tasks[i].manufacturemodifier)
            data.wares.find(t => t.id == data.tasks[i].wareusedinmanufacture).amountowned -= (data.tasks[i].productionperworker * data.tasks[i].workers.length)/data.tasks[i].manufacturemodifier
            data.wares.find(t => t.id == data.tasks[i].waregainedfrommanufacture).amountowned += data.tasks[i].productionperworker * data.tasks[i].workers.length * data.tasks[i].efficency
            if(data.wares.find(t => t.id == data.tasks[i].wareusedinmanufacture).amountowned<0) {
                data.wares.find(t => t.id == data.tasks[i].waregainedfrommanufacture).amountowned += data.wares.find(t => t.id == data.tasks[i].wareusedinmanufacture).amountowned*data.tasks[i].manufacturemodifier * data.tasks[i].efficency
                data.wares.find(t => t.id == data.tasks[i].wareusedinmanufacture).amountowned -= data.wares.find(t => t.id == data.tasks[i].wareusedinmanufacture).amountowned
            }
        }
    }
    //console.log(data.wares)
    return data;
}

function ProgressOnBuildingTasks(data){

    let finishedtask = []
    for(let i = 0; i< data.tasks.length; i++){
        
        if(data.tasks[i].type == 1 && data.tasks[i].workers.length>0) {
            let hoursworked = 0;
            for(let j = 0; j < data.tasks[i].workers.length; j++){
                hoursworked += data.professions.find(t => t.id == data.citizens.find(c => c.id == data.tasks[i].workers[j]).profession).workhours*data.tasks[i].efficency;
            }
            if(data.structures.find(t => t.id == data.tasks[i].structureworkedon).workhoursneeded < hoursworked){
                hoursworked = data.structures.find(t => t.id == data.tasks[i].structureworkedon).workhoursneeded;
                data.structures.find(t => t.id == data.tasks[i].structureworkedon).underconstruction = false;
                finishedtask.push(data.tasks[i].id)
                for(let m = 0; m < data.citizens.length; m++){
                    if(data.citizens[m].task == data.tasks[i].id){
                        data.citizens[m].task = ""
                    }
                }
            }
            data.structures.find(t => t.id == data.tasks[i].structureworkedon).workhoursneeded -= hoursworked;
            for(let k = 0; k < data.structures.find(t => t.id == data.tasks[i].structureworkedon).materialsneeded.length; k++){
                data.structures.find(t => t.id == data.tasks[i].structureworkedon).materialsneeded[k].amountneeded -= data.structuredesigns.find(t => t.id == data.structures.find(p => p.id == data.tasks[i].structureworkedon).designused).buildingmaterials[k].amountneeded*hoursworked;
                for(let x = 0; x < data.wares.length; x++){
                    if(data.wares[x].id == data.structures.find(t => t.id == data.tasks[i].structureworkedon).materialsneeded[k].id) {
                        data.wares[x].amountowned -= data.structuredesigns.find(t => t.id == data.structures.find(p => p.id == data.tasks[i].structureworkedon).designused).buildingmaterials[k].amountneeded*hoursworked;
                    }
                }
            }
        } 
    }

    if(finishedtask.length > 0){
        for(let i = 0; i < data.tasks.length; i++){
            for(let j = 0; j<finishedtask.length; j++){
                if(data.tasks[i].id == finishedtask[j]) {
                    data.tasks = data.tasks.filter(t => t.id != data.tasks[i].id)
                }
            }
        }
    }

    return data;
}

module.exports = endturn