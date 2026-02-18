#include "dfs.h"
#include <bits/stdc++.h>
using namespace std;

void dfsHelper(int node,
               vector<vector<int>>& adj,
               vector<bool>& visited,
               vector<int>& traversal) {

    visited[node] = true;
    traversal.push_back(node);

    for (int neighbor : adj[node]) {
        if (!visited[neighbor]) {
            dfsHelper(neighbor, adj, visited, traversal);
        }
    }
}

vector<int> dfs(int V, vector<vector<int>>& adj, int start) {
    vector<int> traversal;
    vector<bool> visited(V, false);

    dfsHelper(start, adj, visited, traversal);

    return traversal;
}
