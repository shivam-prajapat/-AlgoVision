#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <vector>
#include <string>
#include <queue>
#include <stack>
#include <map>

using namespace emscripten;

val runLinearSearch(val array, int target) {
    val steps = val::array();
    int length = array["length"].as<int>();
    int stepIdx = 0;

    for (int i = 0; i < length; i++) {
        int currentVal = array[i].as<int>();

        val visit = val::object();
        visit.set("type", "visit");
        visit.set("index", i);
        val indices = val::object();
        indices.set("current", i);
        visit.set("indices", indices);
        visit.set("explanation", "Checking element at index " + std::to_string(i) + " (value: " + std::to_string(currentVal) + ")");
        steps.set(stepIdx++, visit);

        if (currentVal == target) {
            val found = val::object();
            found.set("type", "found");
            found.set("index", i);
            val fIndices = val::object();
            fIndices.set("current", i);
            found.set("indices", fIndices);
            found.set("explanation", "✅ Found target " + std::to_string(target) + " at index " + std::to_string(i) + "!");
            steps.set(stepIdx++, found);
            return steps;
        }

        val compare = val::object();
        compare.set("type", "compare");
        compare.set("index", i);
        val cIndices = val::object();
        cIndices.set("current", i);
        compare.set("indices", cIndices);
        compare.set("explanation", std::to_string(currentVal) + " ≠ " + std::to_string(target) + ", moving to next element");
        steps.set(stepIdx++, compare);
    }

    val notFound = val::object();
    notFound.set("type", "not_found");
    notFound.set("index", -1);
    notFound.set("indices", val::object());
    notFound.set("explanation", "❌ Target " + std::to_string(target) + " not found in the array");
    steps.set(stepIdx++, notFound);

    return steps;
}

val runBinarySearch(val array, int target) {
    val steps = val::array();
    int length = array["length"].as<int>();
    int stepIdx = 0;

    int left = 0;
    int right = length - 1;

    while (left <= right) {
        val range = val::object();
        range.set("type", "range");
        val rIndices = val::object();
        rIndices.set("left", left);
        rIndices.set("right", right);
        range.set("indices", rIndices);
        range.set("explanation", "Current search space: index " + std::to_string(left) + " to " + std::to_string(right));
        steps.set(stepIdx++, range);

        int mid = left + (right - left) / 2;
        int midVal = array[mid].as<int>();

        val visit = val::object();
        visit.set("type", "visit");
        visit.set("index", mid);
        val vIndices = val::object();
        vIndices.set("left", left);
        vIndices.set("right", right);
        vIndices.set("mid", mid);
        visit.set("indices", vIndices);
        visit.set("explanation", "Checking middle element at index " + std::to_string(mid) + " (value: " + std::to_string(midVal) + ")");
        steps.set(stepIdx++, visit);

        if (midVal == target) {
            val found = val::object();
            found.set("type", "found");
            found.set("index", mid);
            val fIndices = val::object();
            fIndices.set("left", left);
            fIndices.set("right", right);
            fIndices.set("mid", mid);
            found.set("indices", fIndices);
            found.set("explanation", "✅ Found target " + std::to_string(target) + " at index " + std::to_string(mid) + "!");
            steps.set(stepIdx++, found);
            return steps;
        }

        if (midVal < target) {
            val compare = val::object();
            compare.set("type", "compare");
            compare.set("index", mid);
            val cIndices = val::object();
            cIndices.set("left", left);
            cIndices.set("right", right);
            cIndices.set("mid", mid);
            compare.set("indices", cIndices);
            compare.set("explanation", std::to_string(midVal) + " < " + std::to_string(target) + ", searching right half");
            steps.set(stepIdx++, compare);
            left = mid + 1;
        } else {
            val compare = val::object();
            compare.set("type", "compare");
            compare.set("index", mid);
            val cIndices = val::object();
            cIndices.set("left", left);
            cIndices.set("right", right);
            cIndices.set("mid", mid);
            compare.set("indices", cIndices);
            compare.set("explanation", std::to_string(midVal) + " > " + std::to_string(target) + ", searching left half");
            steps.set(stepIdx++, compare);
            right = mid - 1;
        }
    }

    val notFound = val::object();
    notFound.set("type", "not_found");
    notFound.set("index", -1);
    notFound.set("indices", val::object());
    notFound.set("explanation", "❌ Target " + std::to_string(target) + " not found in the array");
    steps.set(stepIdx++, notFound);

    return steps;
}

struct Point {
    int r, c;
};

val runDFS(val grid, val start, val end) {
    val steps = val::array();
    int stepIdx = 0;

    int rows = grid["length"].as<int>();
    int cols = grid[0]["length"].as<int>();
    
    int startR = start[0].as<int>();
    int startC = start[1].as<int>();
    int endR = end[0].as<int>();
    int endC = end[1].as<int>();

    std::vector<std::vector<bool>> visited(rows, std::vector<bool>(cols, false));
    std::vector<std::vector<Point>> parent(rows, std::vector<Point>(cols, {-1, -1}));
    
    // Copy grid array to native C++ 2D array for speed
    std::vector<std::vector<int>> nativeGrid(rows, std::vector<int>(cols, 0));
    for (int r = 0; r < rows; ++r) {
        val rowArray = grid[r];
        for (int c = 0; c < cols; ++c) {
            nativeGrid[r][c] = rowArray[c].as<int>();
        }
    }

    std::vector<Point> stack;
    stack.push_back({startR, startC});

    int directions[4][2] = {
        {-1, 0}, // up
        {0, 1},  // right
        {1, 0},  // down
        {0, -1}  // left
    };

    val startStep = val::object();
    startStep.set("type", "start");
    startStep.set("row", startR);
    startStep.set("col", startC);
    startStep.set("explanation", "Starting DFS from node (" + std::to_string(startR) + ", " + std::to_string(startC) + "). Using a stack to explore.");
    steps.set(stepIdx++, startStep);

    while (!stack.empty()) {
        Point curr = stack.back();
        stack.pop_back();

        int row = curr.r;
        int col = curr.c;

        if (row < 0 || row >= rows || col < 0 || col >= cols) continue;
        if (visited[row][col] || nativeGrid[row][col] == 1) continue;

        visited[row][col] = true;

        val visit = val::object();
        visit.set("type", "visit");
        visit.set("row", row);
        visit.set("col", col);
        visit.set("explanation", "Visiting node (" + std::to_string(row) + ", " + std::to_string(col) + "). Stack size: " + std::to_string(stack.size()));
        steps.set(stepIdx++, visit);

        if (row == endR && col == endC) {
            std::vector<Point> pathPoints;
            Point p = {row, col};
            while (p.r != -1 && p.c != -1) {
                pathPoints.insert(pathPoints.begin(), p);
                p = parent[p.r][p.c];
            }

            val pathArr = val::array();
            for (size_t i = 0; i < pathPoints.size(); ++i) {
                val pNode = val::array();
                pNode.set(0, pathPoints[i].r);
                pNode.set(1, pathPoints[i].c);
                pathArr.set(i, pNode);
                
                val pStep = val::object();
                pStep.set("type", "path");
                pStep.set("row", pathPoints[i].r);
                pStep.set("col", pathPoints[i].c);
                pStep.set("explanation", "✅ Path found! Tracing path step " + std::to_string(i + 1) + "/" + std::to_string(pathPoints.size()));
                steps.set(stepIdx++, pStep);
            }

            val found = val::object();
            found.set("type", "found");
            found.set("row", row);
            found.set("col", col);
            found.set("path", pathArr);
            found.set("explanation", "✅ Reached target (" + std::to_string(endR) + ", " + std::to_string(endC) + ")! Path length: " + std::to_string(pathPoints.size()) + " nodes");
            steps.set(stepIdx++, found);
            return steps;
        }

        for (int i = 3; i >= 0; i--) {
            int newRow = row + directions[i][0];
            int newCol = col + directions[i][1];

            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols &&
                !visited[newRow][newCol] && nativeGrid[newRow][newCol] != 1) {
                
                stack.push_back({newRow, newCol});
                if (parent[newRow][newCol].r == -1 && parent[newRow][newCol].c == -1) {
                    parent[newRow][newCol] = {row, col};
                }
            }
        }
    }

    val notFound = val::object();
    notFound.set("type", "not_found");
    notFound.set("row", -1);
    notFound.set("col", -1);
    notFound.set("explanation", "❌ No path found to the target node!");
    steps.set(stepIdx++, notFound);

    return steps;
}

val runBFS(val grid, val start, val end) {
    val steps = val::array();
    int stepIdx = 0;

    int rows = grid["length"].as<int>();
    int cols = grid[0]["length"].as<int>();
    
    int startR = start[0].as<int>();
    int startC = start[1].as<int>();
    int endR = end[0].as<int>();
    int endC = end[1].as<int>();

    std::vector<std::vector<bool>> visited(rows, std::vector<bool>(cols, false));
    std::vector<std::vector<Point>> parent(rows, std::vector<Point>(cols, {-1, -1}));
    
    std::vector<std::vector<int>> nativeGrid(rows, std::vector<int>(cols, 0));
    for (int r = 0; r < rows; ++r) {
        val rowArray = grid[r];
        for (int c = 0; c < cols; ++c) {
            nativeGrid[r][c] = rowArray[c].as<int>();
        }
    }

    std::queue<Point> q;
    q.push({startR, startC});
    visited[startR][startC] = true;

    int directions[4][2] = {
        {-1, 0}, // up
        {0, 1},  // right
        {1, 0},  // down
        {0, -1}  // left
    };

    val startStep = val::object();
    startStep.set("type", "start");
    startStep.set("row", startR);
    startStep.set("col", startC);
    startStep.set("explanation", "Starting BFS from node (" + std::to_string(startR) + ", " + std::to_string(startC) + "). Queue enqueued initially.");
    steps.set(stepIdx++, startStep);

    while (!q.empty()) {
        Point curr = q.front();
        q.pop();

        int row = curr.r;
        int col = curr.c;

        val visit = val::object();
        visit.set("type", "visit");
        visit.set("row", row);
        visit.set("col", col);
        visit.set("explanation", "Dequeued and visiting node (" + std::to_string(row) + ", " + std::to_string(col) + "). Elements in queue: " + std::to_string(q.size()));
        steps.set(stepIdx++, visit);

        if (row == endR && col == endC) {
            std::vector<Point> pathPoints;
            Point p = {row, col};
            while (p.r != -1 && p.c != -1) {
                pathPoints.insert(pathPoints.begin(), p);
                p = parent[p.r][p.c];
            }

            val pathArr = val::array();
            for (size_t i = 0; i < pathPoints.size(); ++i) {
                val pNode = val::array();
                pNode.set(0, pathPoints[i].r);
                pNode.set(1, pathPoints[i].c);
                pathArr.set(i, pNode);
                
                val pStep = val::object();
                pStep.set("type", "path");
                pStep.set("row", pathPoints[i].r);
                pStep.set("col", pathPoints[i].c);
                pStep.set("explanation", "✅ Path found! Tracing path step " + std::to_string(i + 1) + "/" + std::to_string(pathPoints.size()));
                steps.set(stepIdx++, pStep);
            }

            val found = val::object();
            found.set("type", "found");
            found.set("row", row);
            found.set("col", col);
            found.set("path", pathArr);
            found.set("explanation", "✅ Reached target (" + std::to_string(endR) + ", " + std::to_string(endC) + ")! Path length: " + std::to_string(pathPoints.size()) + " nodes");
            steps.set(stepIdx++, found);
            return steps;
        }

        for (int i = 0; i < 4; i++) {
            int newRow = row + directions[i][0];
            int newCol = col + directions[i][1];

            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols &&
                !visited[newRow][newCol] && nativeGrid[newRow][newCol] != 1) {
                
                visited[newRow][newCol] = true;
                parent[newRow][newCol] = {row, col};
                q.push({newRow, newCol});

                val enq = val::object();
                enq.set("type", "enqueue");
                enq.set("row", newRow);
                enq.set("col", newCol);
                enq.set("explanation", "Enqueuing valid neighbor (" + std::to_string(newRow) + ", " + std::to_string(newCol) + ").");
                steps.set(stepIdx++, enq);
            }
        }
    }

    val notFound = val::object();
    notFound.set("type", "not_found");
    notFound.set("row", -1);
    notFound.set("col", -1);
    notFound.set("explanation", "❌ No path found to the target node!");
    steps.set(stepIdx++, notFound);

    return steps;
}

EMSCRIPTEN_BINDINGS(my_module) {
    function("runLinearSearch", &runLinearSearch);
    function("runBinarySearch", &runBinarySearch);
    function("runDFS", &runDFS);
    function("runBFS", &runBFS);
}
