class MyGraph {

    constructor(nodes) {
        this.nodes = {};

        for (const node of nodes) {
            this.addNode(node);
        }
        
    }

    getNode(nodeKey) {
        return this.nodes[nodeKey];
    }

    getNodes() {
        return Object.keys(this.nodes);
    }

    getNeighbors(node) {
        return this.nodes[node];
    }

    getParents(node) {
        let parents = [];
        for (const [parent, children] of Object.entries(this.nodes)) {
            if (children.includes(node)) {
                parents.push(parent);
            }
        }
        return parents;
    }

    addNode(node) {
        if (!this.nodes[node]) {
            this.nodes[node] = [];
        }
    }

    addEdge(node1, node2) {
        if (this.nodes[node1] && this.nodes[node2]) {
            this.nodes[node1].push(node2);
        }
    }

    printGraph(startNode) {
        if (this.nodes[startNode]) {
            const graphStructure = {
                [startNode]: this.visit(startNode)
            };

            console.log("Graph: ", JSON.stringify(graphStructure, null, 2));
        } else {
            throw ReferenceError(`Graph does not have node ${startNode}.`);
        }
    }

    visit(node) {
        const neighbors = {};

        this.nodes[node].forEach(neighbor => {
            neighbors[neighbor] = this.visit(neighbor);
        });

        return neighbors;
    }

    /**
    dfs(node) {
        visited[node] = true;
        this.nodes[node].forEach(neighbor => {
            if (!visited[neighbor]) {
                dfs(neighbor);
            }
        });
    };
    */
}

export { MyGraph };