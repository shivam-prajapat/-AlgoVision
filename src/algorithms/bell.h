#ifndef BELLMAN_FORD_H
#define BELLMAN_FORD_H

#include <vector>

std::vector<int> bellmanFord(
    int V,
    std::vector<std::vector<int>>& edges,
    int src
);

#endif
