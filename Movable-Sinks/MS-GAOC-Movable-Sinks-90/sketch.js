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
const VICINITY = 25;        // This is the radius
const VARPHI = 0.3;     // Fitness co-efficients
const DELTA = 0.3;
const GAMMA = 0.4;

let network = null;
let pop = null;
let iterations = 30;
let it = 0;
let deploymentStrategy = true;
const NRM_CONFLICT_RANGE = 15;
function setup () {
    createCanvas (800, 800);    
    if (deploymentStrategy)
        network = new Network (N).initNetParams (NF_ADV, NF_INT, EF_ALPHA, EF_BETA).deploymentStrategy (15).generateSinks ().generateDistMatrix ();
    else 
        network = new Network (N).initNetParams (NF_ADV, NF_INT, EF_ALPHA, EF_BETA).generateNodes ().generateSinks ().generateDistMatrix ();
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
        // console.log("STOPPED")
    }
    background (255);
    // Net area
    noFill ();
    stroke (255)
    strokeWeight (0.1);
    rect (X, Y, W, H);

    pop.display ();
    if (network.nodes.filter(n => n.resEnergy > 0).length != 0) {
        pop.calFitness ().fittest ().evolve ();
    } else {
        console.log("FINISHED! Data Packets Sent: ", RadioConsumptionModel.dataPacketSent)
        noLoop();
    }
    network.updateSinks();
}

function clustering () {
    while (true) {
        it++;
        if (it == iterations) {
            energyModel ();
            it = 0;
        }
        // Uncomment to check for stability
        // if (network.nodes.filter(n => n.resEnergy < 0).length > 0)
        //     break;
        if (network.nodes.filter(n => n.resEnergy > 0).length != 0) {
            pop.calFitness ().fittest ().evolve ();
        } else {
            console.log("FINISHED! Data Packets Sent: ", RadioConsumptionModel.dataPacketSent)
            break;
        }
        network.updateSinks();
    }
}


let deadCount = 0;
let r = 0;
function energyModel () {
        let d = new RadioConsumptionModel ();
        let obj = pop.generateClusters ();
        while (true) {
            r++;
            d.evanesce (obj.C, obj.NCN); 
            if (r % 200 == 0) {
                storeResult (r, deadCount, network.calNetEnergy(), pop.chromosomes[pop.fittestIndex].countClusterHeads(), RadioConsumptionModel.dataPacketSent)
            }
            let currentDeadCount = network.nodes.filter(node => node.resEnergy <= 0).length;
            if (currentDeadCount != deadCount) {
                deadCount = currentDeadCount;
                console.log("Rounds: ", r, "Dead Nodes: ", deadCount, "Energy: ", network.calNetEnergy());
                storeResult (r, deadCount, network.calNetEnergy(), pop.chromosomes[pop.fittestIndex].countClusterHeads(), RadioConsumptionModel.dataPacketSent)
                RadioConsumptionModel.nprob += 0.03;
                RadioConsumptionModel.cprob += 0.01;
                break;
            }
        }
}