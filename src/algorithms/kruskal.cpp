#include "kruskal.h"
#include <bits/stdc++.h>
using namespace std;

class DisjointSet {
public:
    vector<int> parent, rank;

    DisjointSet(int n) {
        parent.resize(n);
        rank.resize(n, 0);
        for (int i = 0; i < n; i++)
            parent[i] = i;
    }

    int find(int x) {
        if (parent[x] != x)
            parent[x] = find(parent[x]);
        return parent[x];
    }

    void unite(int x, int y) {
        int px = find(x);
        int py = find(y);

        if (px == py) return;

        if (rank[px] < rank[py])
            parent[px] = py;
        else if (rank[px] > rank[py])
            parent[py] = px;
        else {
            parent[py] = px;
            rank[px]++;
        }
    }
};

int kruskal(int V, vector<vector<int>>& edges) {

    sort(edges.begin(), edges.end(),
         [](vector<int>& a, vector<int>& b) {
             return a[2] < b[2];
         });

    DisjointSet ds(V);
    int mstWeight = 0;

    for (auto& edge : edges) {
        int u = edge[0];
        int v = edge[1];
        int w = edge[2];

        if (ds.find(u) != ds.find(v)) {
            mstWeight += w;
            ds.unite(u, v);
        }
    }

    return mstWeight;
}
