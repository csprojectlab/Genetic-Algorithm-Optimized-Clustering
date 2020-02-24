class Population {
    constructor (pop_size, elitism) {
        this.size = pop_size;
        this.elitism = elitism;
        this.chromosomes = null;
        this.fittestIndex = -1;
        return this;
    }

    boot () {
        this.chromosomes = new Array (this.size);
        for (let i = 0; i < this.size; i++)     // Create a population
            this.chromosomes[i] = new Chromosome ();
        return this;
    }

    generateChromosomes () {
        this.chromosomes.forEach (c => c.generateChromosome ());
        return this;
    }

    calFitness () {
        this.chromosomes.forEach (c => c.calFitness ())
        return this;
    }

    fittest () {
        let f = -Infinity;
        this.chromosomes.forEach ((c, i) => {
            if (c.fitness > f) {
                f = c.fitness;
                this.fittestIndex = i;
            }
        })
        return this;
    }

    createMatingPool () {
        let fitnessSum = 0;
        this.chromosomes.forEach (c => fitnessSum += c.fitness);
        let probability = [];
        this.chromosomes.forEach (c => probability.push (c.fitness / fitnessSum * 100));
        let matingPool = [];
        let limit;
        this.chromosomes.forEach ((c, index) => {
            limit = ceil (probability[index] * c.fitness);
            for (let i = 0; i < limit; i++)
                matingPool.push (index);
        });
        return matingPool;
    }

    evolve () {
        // Normalize fitness
        let bestFitness = this.chromosomes[this.fittestIndex].fitness;
        this.chromosomes.forEach (c => c.fitness = c.fitness / bestFitness);
        // Create mating pool using ranke selection method
        let matingPool = this.createMatingPool ();
        let newPop = [];
        if (this.elitism)
            newPop.push (this.chromosomes[this.fittestIndex].copy ());
        let offset = 1;
        while (newPop.length < this.size) {
            if (random (1) < CROSSOVER_RATE) {
                let child = null;
                let attempts = 0;
                while (child == null) {
                    if (attempts == 3)  break;
                    let parentOne = this.chromosomes[matingPool[floor (random (matingPool.length))]];
                    let parentTwo = this.chromosomes[matingPool[floor (random (matingPool.length))]];    
                    child = parentOne.crossover (parentTwo);
                    attempts++;
                }
                if (child) {
                    child.mutate (MUTATION_RATE);
                    newPop.push (child);
                } else {
                    // TODO(Ari): Child returned by crossover is not valid, hence null. Don't know what to do
                    // console.log ("NULL CHILD");
                }        
            } else {
                newPop.push (this.chromosomes[offset].copy ());
                offset++;
            }
        }
        this.chromosomes = newPop;
        return this;
    }

    generateClusters () {
        let clusters = {};
        let nonClusterNodes = [];
        let heads = [];
        this.chromosomes[this.fittestIndex].genes.forEach ((v, i) => {
            if (v == 1) {
                clusters[i] = {SI: -1, N: []};
                heads.push (i);
            }
        });
        network.nodes.forEach ((node, index) => {
            if (!heads.includes (index)) {
                let headIndex = Utils.closestHead (network.nodeDistance, index, heads);
                if (headIndex == -1) {   // Node is not part of any cluster
                    nonClusterNodes.push ({I: index, SI: Utils.closestSink (network.sinkDistance, index, network.sinks)});
                } else {
                    clusters[headIndex]["N"].push (index);
                    clusters[headIndex]["SI"] = Utils.closestSink (network.sinkDistance, headIndex, network.sinks);
                }
            }
        })
        return {C: clusters, NCN: nonClusterNodes};     // non cluster nodes
    }

    display () {
        // network.display (this.chromosomes[this.fittestIndex].genes)
        network.sinks.forEach (sink => sink.display ())
        let obj = this.generateClusters ();
        this.displayClusteredStructure (obj.C, obj.NCN)
    }

    displayClusteredStructure (clusters, ncn) {
        // Display the non cluster nodes. 
        ncn.forEach (obj => {
            if (network.nodes[obj.I].resEnergy > 0) {
                network.nodes[obj.I].display();
                strokeWeight (0.4)
                stroke (255, 0, 0)
                line (network.nodes[obj.I].pos.x, network.nodes[obj.I].pos.y, network.sinks[obj.SI].pos.x, network.sinks[obj.SI].pos.y);
            }
            
        }); 
        let index = 0;
        Object.keys (clusters).forEach (head_index => {
            // let col = color(random(255), random(255), random(255));
            let col = selectedColors[index];
            index = (index + 1) % selectedColors.length;
            if (network.nodes[head_index].resEnergy > 0) {
                network.nodes[head_index].display (1, col);
                strokeWeight (0.4)
                stroke(255, 0, 0);
                // console.log(clusters[head_index]["SI"])
                if (clusters[head_index]["SI"] != -1)
                    line (network.nodes[head_index].pos.x, network.nodes[head_index].pos.y, network.sinks[clusters[head_index]["SI"]].pos.x, network.sinks[clusters[head_index]["SI"]].pos.y);
            }
            clusters[head_index]["N"].forEach (common_node_index => {
                if (network.nodes[common_node_index].resEnergy > 0) {
                    network.nodes[common_node_index].display();
                    strokeWeight (0.4)
                    stroke(col);
                    line (network.nodes[common_node_index].pos.x, network.nodes[common_node_index].pos.y, network.nodes[head_index].pos.x, network.nodes[head_index].pos.y);
                }                
            })
        });
    }
}