import { dijkstra } from '../src/algorithms/wasmAdapter.js';

console.log("Testing dijkstra...");
const numNodes = 3;
const adjList = [
    [[1, 10]],
    [[2, 5]],
    []
];
const startNode = 0;

try {
    const gen = dijkstra(numNodes, adjList, startNode);
    for (let step of gen) {
        console.log("Step:", step);
    }
    console.log("Done");
} catch (e) {
    console.error("Error:", e);
}
