#ifndef DIJKSTRA_H
#define DIJKSTRA_H

#include <vector>
#include <utility>

std::vector<int> dijkstra(
    int V,
    std::vector<std::vector<std::pair<int,int>>>& adj,
    int src
);

#endif