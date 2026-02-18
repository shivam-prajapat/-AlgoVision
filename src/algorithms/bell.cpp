#include "bell.h"
#include <bits/stdc++.h>
using namespace std;
vector<int> bellmanFord(int V,
                        vector<vector<int>>& edges,
                        int src) {

    vector<int> dist(V, INT_MAX);
    dist[src] = 0;

    for (int i = 0; i < V - 1; i++) {
        for (auto& edge : edges) {
            int u = edge[0];
            int v = edge[1];
            int w = edge[2];

            if (dist[u] != INT_MAX &&
                dist[u] + w < dist[v]) {
                dist[v] = dist[u] + w;
            }
        }
    }

    return dist;
}
