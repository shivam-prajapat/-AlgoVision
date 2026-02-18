#include "dijkstra.h"
#include <bits/stdc++.h>
using namespace std;
vector<int> dijkstra(int V,
                     vector<vector<pair<int,int>>>& adj,
                     int src) {

    vector<int> dist(V, INT_MAX);

    priority_queue<
        pair<int,int>,
        vector<pair<int,int>>,
        greater<pair<int,int>>
    > pq;

    dist[src] = 0;
    pq.push({0, src});

    while (!pq.empty()) {
        int d = pq.top().first;
        int node = pq.top().second;
        pq.pop();

        for (auto& neighbor : adj[node]) {
            int adjNode = neighbor.first;
            int weight = neighbor.second;

            if (d + weight < dist[adjNode]) {
                dist[adjNode] = d + weight;
                pq.push({dist[adjNode], adjNode});
            }
        }
    }

    return dist;
}
