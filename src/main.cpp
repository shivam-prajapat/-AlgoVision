#include <bits/stdc++.h>
#include "algorithms/bfs.h"
#include "algorithms/dfs.h"
#include "algorithms/dijkstra.h"
#include "algorithms/bell.h"
#include "algorithms/kruskal.h"

using namespace std;

void printVector(const vector<int>& v) {
    for (int x : v) {
        if (x == INT_MAX)
            cout << "INF ";
        else
            cout << x << " ";
    }
    cout << endl;
}

int main() {

    int choice;

    while (true) {

        cout << "\n===== GRAPH ALGORITHM SIMULATOR =====\n";
        cout << "1. BFS\n";
        cout << "2. DFS\n";
        cout << "3. Dijkstra\n";
        cout << "4. Bellman-Ford\n";
        cout << "5. Kruskal\n";
        cout << "6. Exit\n";
        cout << "Enter choice: ";

        cin >> choice;

        if (choice == 6) {
            cout << "Exiting...\n";
            break;
        }

        int V, E;
        cout << "Enter number of vertices: ";
        cin >> V;

        cout << "Enter number of edges: ";
        cin >> E;

        if (choice == 1 || choice == 2) {
            // Unweighted graph
            vector<vector<int>> adj(V);

            cout << "Enter edges (u v):\n";
            for (int i = 0; i < E; i++) {
                int u, v;
                cin >> u >> v;
                adj[u].push_back(v);
                adj[v].push_back(u);  // undirected
            }

            int start;
            cout << "Enter start node: ";
            cin >> start;

            if (choice == 1) {
                vector<int> result = bfs(V, adj, start);
                cout << "BFS Traversal:\n";
                printVector(result);
            } else {
                vector<int> result = dfs(V, adj, start);
                cout << "DFS Traversal:\n";
                printVector(result);
            }
        }

        else if (choice == 3) {
            // Dijkstra (Weighted)
            vector<vector<pair<int,int>>> adj(V);

            cout << "Enter edges (u v weight):\n";
            for (int i = 0; i < E; i++) {
                int u, v, w;
                cin >> u >> v >> w;
                adj[u].push_back({v, w});
                adj[v].push_back({u, w});  // undirected
            }

            int start;
            cout << "Enter source node: ";
            cin >> start;

            vector<int> dist = dijkstra(V, adj, start);

            cout << "Shortest distances:\n";
            printVector(dist);
        }

        else if (choice == 4) {
            // Bellman-Ford
            vector<vector<int>> edges;

            cout << "Enter edges (u v weight):\n";
            for (int i = 0; i < E; i++) {
                int u, v, w;
                cin >> u >> v >> w;
                edges.push_back({u, v, w});
            }

            int start;
            cout << "Enter source node: ";
            cin >> start;

            vector<int> dist = bellmanFord(V, edges, start);

            cout << "Shortest distances:\n";
            printVector(dist);
        }

        else if (choice == 5) {
            // Kruskal
            vector<vector<int>> edges;

            cout << "Enter edges (u v weight):\n";
            for (int i = 0; i < E; i++) {
                int u, v, w;
                cin >> u >> v >> w;
                edges.push_back({u, v, w});
            }

            int mstWeight = kruskal(V, edges);

            cout << "Total MST Weight: " << mstWeight << endl;
        }

        else {
            cout << "Invalid choice!\n";
        }
    }

    return 0;
}
