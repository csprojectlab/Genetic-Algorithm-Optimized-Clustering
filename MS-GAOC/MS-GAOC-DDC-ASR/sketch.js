// Network Area Size
const W = 100;    // Can be 500 in another scenario
const H = 100;    // can be 500 also
const X = 100;      // Starting position co-ordinates
const Y = 100;

// Node types
const NODE_TYPE = {
    ADV : "ADVANCED",
    INT : "INTERMEDIATE",
    NRM : "NORMAL"
}

// Energy parameters
const Eo = 0.5;   // Initial energy
const EF_ALPHA = 2;     // Energy fraction of advanced nodes
const EF_BETA = 1;      // Energy fraction of intermediate nodes
const NF_INT = 0.2;     // Number of intermediate nodes m0
const NF_ADV = 0.1;     // Number of advanced nodes m
const E_ELC = 50 * 0.000000001;      // Energy required for running transmitter and receiver
const E_EFS = 10 * 0.000000000001;    // Amplification energy required for smaller distance
const E_AMP = 0.0013 * 0.000000000001;       // Amplification energy required for larger distance
const Do = Math.sqrt (E_EFS / E_AMP);

// Packet size
const PACKET_SIZE = 2000;       // bits

// Genetic parameters. Selection method is Rank Selection Method 
const N = 100;    // can be 200 in another scenario
const POP_SIZE = 30;
const CROSSOVER_RATE = 0.6;
const MUTATION_RATE = 0.006;
const NRM_CONFLICT_RANGE = 15;
const NON_CLUSTER_RANGE = 40;   // This is the DDC range.
const VICINITY = 40;        // This is the radius
const VARPHI = 0.3;     // Fitness co-efficients
const DELTA = 0.3;
const GAMMA = 0.4;

let network = null;
let pop = null;
let iterations = 30;
let it = 0;
let deploymentStrategy = true;
let tier = "Tier 3";
const Tier = {
    "T1": "Tier 1", "T2": "Tier 2", "T3": "Tier 3"
}


let selectedColors = [];
function setup () {
    selectedColors = [
        color(51,0,0), color(102,51,0), color(255,153,51), color(51,102,0), color(102,255,178), color(0,102,204), color(204,0,204), color(102,0,102), color(255,102,102), color(102,178,255)
    ]
    createCanvas (800, 800);  
    if (tier == Tier.T1) {
        network = new Network (N).initNetParams (NF_ADV, NF_INT, EF_ALPHA, EF_BETA).generateNodes (Tier.T1).generateSinks ().generateDistMatrix ().adjustSensingRange ();
    } else if (tier == Tier.T2) {
        network = new Network (N).initNetParams (NF_ADV, NF_INT, EF_ALPHA, EF_BETA).generateNodes (Tier.T2).generateSinks ().generateDistMatrix ().adjustSensingRange ();
    }  else if (tier == Tier.T3) {
        if (deploymentStrategy)
        network = new Network (N).initNetParams (NF_ADV, NF_INT, EF_ALPHA, EF_BETA).deploymentStrategy (15).generateSinks ().generateDistMatrix ().adjustSensingRange ();
    else
        network = new Network (N).initNetParams (NF_ADV, NF_INT, EF_ALPHA, EF_BETA).generateNodes ().generateSinks ().generateDistMatrix ().adjustSensingRange ();;
    }
    pop = new Population (POP_SIZE, true).boot ().generateChromosomes ();
    pop.calFitness ().fittest ().evolve ();
    clustering ();
}

function draw1 () {
    it++;
    if (it == iterations) {
        // console.log("Iterations DONE")
        energyModel ();       
        it = 0;
        // noLoop();
    }
    background (255);
    // Net area
    noFill ();
    stroke (0)
    strokeWeight (0.7);
    rect (X, Y, W, H);

    pop.display ();
    if (network.nodes.filter(n => n.resEnergy > 0).length != 0) {
        pop.calFitness ().fittest ().evolve ();
    } else {
        console.log("FINISHED! Data Packets Sent: ", RadioConsumptionModel.dataPacketSent)
        noLoop();
    }
}

function clustering () {
    while (true) {
        it++;
        if (it == iterations) {
            energyModel ();
            it = 0;
        }
        if (network.nodes.filter(n => n.resEnergy > 0).length != 0) {
            pop.calFitness ().fittest ().evolve ();
        } else {
            console.log("FINISHED! Data Packets Sent: ", RadioConsumptionModel.dataPacketSent)
            break;
        }
    }
}


let deadCount = 0;
let r = 0;
function energyModel () {
        let d = new RadioConsumptionModel ();
        let obj = pop.generateClusters ();
        while (true) {
            r++;
            d.broadcastMessage(obj.C)
            d.evanesce (obj.C, obj.NCN); 
            if (r % 200 == 0) {
                storeResult (r, deadCount, network.calNetEnergy(), pop.chromosomes[pop.fittestIndex].countClusterHeads(), RadioConsumptionModel.dataPacketSent, d.sinksLoad)
            }
            let currentDeadCount = network.nodes.filter(node => node.resEnergy <= 0).length;
            if (currentDeadCount != deadCount) {
                deadCount = currentDeadCount;
                console.log("Rounds: ", r, "Dead Nodes: ", deadCount, "Energy: ", network.calNetEnergy());
                storeResult (r, deadCount, network.calNetEnergy(), pop.chromosomes[pop.fittestIndex].countClusterHeads(), RadioConsumptionModel.dataPacketSent, d.sinksLoad)
                RadioConsumptionModel.nprob += 0.1;
                RadioConsumptionModel.cprob += 0.04;
                break;
            }
        }
}
