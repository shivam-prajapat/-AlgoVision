#include "bfs.h"
#include <bits/stdc++.h>
using namespace std;


vector<int> bfs(int V, vector<vector<int>>& adj, int start) {
    vector<int>traversal;
    vector<bool>visited(V, false);
    queue<int> q;
    visited[start] = true;
    q.push(start);

    while (!q.empty()) {
        int node = q.front();
        q.pop();

        traversal.push_back(node);

        for (int neighbor : adj[node]) {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                q.push(neighbor);
            }
        }
    }

    return traversal;
}
