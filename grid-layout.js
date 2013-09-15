/**
 * By Hans Yu
 */
function GridLayout(nodes) {
	this.nodes = nodes;
}

/* Generates layout by 3D grid algorithm */
GridLayout.prototype.generate3DLayout = function() {
	/* Sort nodes by number of connections from most to least */
	var nodes = this.nodes.sort(function(a, b) {
		return b.connections.length - a.connections.length;
	});
	
	/* Generate weight matrix */
	var weightMatrix = GridLayout.generateWeightMatrix(nodes);

	/* Initialize 3D grid */
	var gridSize = Math.ceil(Math.pow(nodes.length, 1/3)) * 2;
	var grid = [];
	for (var n = 0; n < gridSize; n++) {
		grid.push([]);
		for (var m = 0; m < gridSize; m++) {
			grid[n].push([]);
			for (var o = 0; o < gridSize; o++) {
				grid[n][m].push(-1);
			}
		}
	}

	/* Initialize node positions */
	for (n = 0; n < nodes.length; n++) {
		GridLayout.randomlyPositionNodeFor3D(n, nodes, grid);
	}

	/* Generate cost matrix */
	var costMatrix = [];
	for (n = 0; n < nodes.length - 1; n++) {
		costMatrix.push([]);
		for (var m = 0; m < nodes.length - n - 1; m++) {
			costMatrix[n].push(GridLayout.calculateCostBetweenNodesFor3D(nodes[n], nodes[m + n + 1], weightMatrix[n][m]));
		}
	}

	/* Minimization loop */
	var perturbation = 0.6;
	do {
		/* Randomly reposition {perturbation} of nodes with lowest cost */
		var totalCosts = [];
		for (n = 0; n < nodes.length; n++) {
			totalCosts.push(GridLayout.getNodeTotalCostForGrid(n, costMatrix));
		}
		var sortedTotalCosts = totalCosts.slice(0).sort(function(a, b) {
			return a - b;
		});
		var threshold = sortedTotalCosts[Math.floor(nodes.length * perturbation)];
		for (n = 0; n < nodes.length; n++) {
			if (totalCosts[n] < threshold) {
				grid[nodes[n].position.x][nodes[n].position.y][nodes[n].position.z] = -1;
				GridLayout.randomlyPositionNodeFor3D(n, nodes, grid);
				GridLayout.updateNodeCostsForGrid(n, GridLayout.findNodeCostsFor3D(n, nodes, weightMatrix), costMatrix);
			}
		}

		/* Minimize each node */
		for (n = 0; n < nodes.length; n++) {
			var node = nodes[n];

			/* Remove node from grid */
			grid[node.position.x][node.position.y][node.position.z] = -1;

			/* Initialize minimum position */
			var minimumPosition = {
				x: node.position.x,
				y: node.position.y,
				z: node.position.z
			};

			/* Initialize minimum cost */
			var minimumTotalCost = GridLayout.getNodeTotalCostForGrid(n, costMatrix);
			var minimumCosts = [];
			for (var m = 0; m < n; m++) {
				minimumCosts.push(costMatrix[m][n - m - 1]);
			}
			var length = nodes.length - n - 1;
			for (m = 0; m < length; m++) {
				minimumCosts.push(costMatrix[n][m]);
			}
			/* Check each vacant grid position for minimum */
			for (var a = 0; a < gridSize; a++) {
				node.position.x = a;
				for (var b = 0; b < gridSize; b++) {
					node.position.y = b;
					for (var c = 0; c < gridSize; c++) {
						if (grid[a][b][c] != -1) continue;
						node.position.z = c;
						var costs = GridLayout.findNodeCostsFor3D(n, nodes, weightMatrix);
						var totalCost = 0;
						for (var o = 0; o < costs.length; o++) {
							totalCost += costs[o];
						}
						if (totalCost < minimumTotalCost) {
							minimumPosition.x = node.position.x;
							minimumPosition.y = node.position.y;
							minimumPosition.z = node.position.z;
							minimumTotalCost = totalCost;
							for (m = 0; m < costs.length; m++) {
								minimumCosts[m] = costs[m];
							}
						}
					}
				}
			}

			/* Update node position */
			node.position = minimumPosition;
			grid[node.position.x][node.position.y][node.position.z] = n;

			/* Update node costs */
			GridLayout.updateNodeCostsForGrid(n, minimumCosts, costMatrix);
		}

		/* Decrease perturbation for next iteration */
		perturbation -= 0.05;
	} while (perturbation > 0);

	/* Transform grid coordinates into world coordinates */
	for (n = 0; n < nodes.length; n++) {
		nodes[n].position.x = nodes[n].position.x - Math.floor(gridSize * 0.5);
		nodes[n].position.y = nodes[n].position.y - Math.floor(gridSize * 0.5);
		nodes[n].position.z = nodes[n].position.z - Math.floor(gridSize * 0.5);
	}
	
	return nodes;
}

/* Randomly positions a node in 3D grid */
GridLayout.randomlyPositionNodeFor3D = function(nodeIndex, nodes, grid) {
	var x = null, y = null, z = null;
	do {
		x = Math.floor(Math.random() * grid.length);
		y = Math.floor(Math.random() * grid.length);
		z = Math.floor(Math.random() * grid.length);
	} while (grid[x][y][z] != -1);
	grid[x][y][z] = nodeIndex;
	nodes[nodeIndex].position = {
		x: x,
		y: y,
		z: z
	};
}

/* Calculates the cost between two nodes */
GridLayout.calculateCostBetweenNodesFor3D = function(node1, node2, weight) {
	var distance = Math.abs(node1.position.x - node2.position.x) + Math.abs(node1.position.y - node2.position.y) + Math.abs(node1.position.z - node2.position.z);
	return weight / distance / distance;
}

/* Finds the costs for a node */
GridLayout.findNodeCostsFor3D = function(nodeIndex, nodes, weightMatrix) {
	var node = nodes[nodeIndex];
	var costs = [];
	for (var n = 0; n < nodeIndex; n++) {
		costs.push(GridLayout.calculateCostBetweenNodesFor3D(node, nodes[n], weightMatrix[n][nodeIndex - n - 1]));
	}
	var length = nodes.length - nodeIndex - 1;
	for (n = 0; n < length; n++) {
		costs.push(GridLayout.calculateCostBetweenNodesFor3D(node, nodes[nodeIndex + n + 1], weightMatrix[nodeIndex][n]));
	}
	return costs;
}

/* Gets the total cost of a node */
GridLayout.getNodeTotalCostForGrid = function(nodeIndex, costMatrix) {
	var totalCost = 0;
	for (var n = 0; n < nodeIndex; n++) {
		totalCost += costMatrix[n][nodeIndex - n - 1];
	}
	var length = costMatrix.length - nodeIndex;
	for (n = 0; n < length; n++) {
		totalCost += costMatrix[nodeIndex][n];
	}
	return totalCost;
}

/* Updates costs of node specified by nodeIndex */
GridLayout.updateNodeCostsForGrid = function(nodeIndex, costs, costMatrix) {
	for (var n = 0; n < nodeIndex; n++) {
		costMatrix[n][nodeIndex - n - 1] = costs[n];
	}
	for (n = 0; n < costs.length - nodeIndex; n++) {
		costMatrix[nodeIndex][n] = costs[n + nodeIndex];
	}
}

/* Generate weight matrix */
GridLayout.generateWeightMatrix = function(nodes) {
	var weightMatrix = [];
	for (var n = 0; n < nodes.length - 1; n++) {
		weightMatrix.push([]);
		for (var m = 0; m < nodes.length - n - 1; m++) {
			var distance = GridLayout.findDistanceBetweenNodes(nodes[n], nodes[n + m + 1], 4);
			var weight = 0.1;
			if (distance == 1) {
				weight = -1;
			}
			else if (distance == 2) {
				weight = 0.0001;
			}
			else if (distance == 3) {
				weight = 0.001;
			}
			else if (distance == 4) {
				weight = 0.01;
			}
			weightMatrix[n].push(weight);
		}
	}
	return weightMatrix;
}

/* Tries to find the shortest distance less than or equal to maxDistance between node1 and node */
GridLayout.findDistanceBetweenNodes = function(node1, node2, maxDistance) {
	var distance = maxDistance + 1;
	for (var n = 0; n < node1.connections.length; n++) {
		if (node1.connections[n].targetNode == node2) {
			return 1;
		}
		else if (maxDistance > 1) {
			var _distance = GridLayout.findDistanceBetweenNodes(node1.connections[n].targetNode, node2, maxDistance - 1);
			if (_distance > 0 && _distance < distance) {
				distance = _distance;
			}
		}
	}
	if (distance > maxDistance) {
		return -1;
	}
	else {
		return distance + 1;
	}
}
