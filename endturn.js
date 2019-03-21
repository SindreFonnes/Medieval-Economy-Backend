function endturn(days, data, func){
    for(let i = 0; i<days; i++){
        data.money += MoneyChangeFromCitizenProfessions(data)
        data.money += TaskExpenses(data)
        data = AddWaresGainedFromTasks(data)
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
    let underConstruction = data.structures.filter(underConstruction => underConstruction.underconstruction);
    
    for(let i = 0; i<underConstruction.length;i++) {
        for(let j = 0; j<underConstruction.materialsneeded.length; j++){
            underConstruction[i].materialsneeded[j].amountneeded
        }
    }
}

module.exports = endturn