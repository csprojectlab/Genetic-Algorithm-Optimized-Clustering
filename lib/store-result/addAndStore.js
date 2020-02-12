// For recording the results
let roundsArray = [];
let deadNodesArray = [];
let aliveNodesArray = [];
let energyArray = [];
let dataPacketsArray = [];
let numberOfClusterHeadsArray = [];

function storeResult (rounds, deadNodes, energy, clusters, packets) {
    roundsArray.push (rounds)
    deadNodesArray.push (deadNodes)
    aliveNodesArray.push ((tier == Tier.T1 ? 140 : N) - deadNodes)
    energyArray.push (energy < 0 ? 0 : energy)
    dataPacketsArray.push (packets)
    numberOfClusterHeadsArray.push (clusters == undefined ? 0 : clusters);
}


function downloadCSV (fileName) {
    if (deploymentStrategy)
        fileName += "-deployment";
    fileName += ".csv";
    let csv = "Rounds,Dead,Alive,Energy,PacketSent,CH\n";
    for (let i = 0; i < roundsArray.length; i++) {
        csv += roundsArray[i] + "," + deadNodesArray[i] + "," + aliveNodesArray[i] + "," + energyArray[i] + "," + dataPacketsArray[i] + "," + numberOfClusterHeadsArray[i];
        csv += "\n"
    }
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName;
    hiddenElement.click();
}