#include <emscripten/bind.h>
#include <emscripten/val.h>
#include <vector>
#include <string>
#include <queue>
#include <algorithm>
#include <limits>
using namespace emscripten;
static const int INF = std::numeric_limits<int>::max();
// helpers
struct GridPoint { int r, c; };
// linear search
val runLinearSearch(val arr, int target) {
    val steps = val::array();
    int len = arr["length"].as<int>(), idx = 0;
    for (int i = 0; i < len; i++) {
        int v = arr[i].as<int>();
        val s = val::object();
        s.set("type", std::string("visit"));
        s.set("index", i);
        val ind = val::object(); ind.set("current", i);
        s.set("indices", ind);
        s.set("explanation", "Checking index " + std::to_string(i) + " (value=" + std::to_string(v) + ")");
        steps.set(idx++, s);
        if (v == target) {
            val f = val::object();
            f.set("type", std::string("found"));
            f.set("index", i);
            val fi = val::object(); fi.set("current", i);
            f.set("indices", fi);
            f.set("explanation", " Found " + std::to_string(target) + " at index " + std::to_string(i));
            steps.set(idx++, f);
            return steps;
        }
        val c = val::object();
        c.set("type", std::string("compare"));
        c.set("index", i);
        val ci = val::object(); ci.set("current", i);
        c.set("indices", ci);
        c.set("explanation", std::to_string(v) + " ≠ " + std::to_string(target) + ", move next");
        steps.set(idx++, c);
    }
    val nf = val::object();
    nf.set("type", std::string("not_found"));
    nf.set("index", -1);
    nf.set("indices", val::object());
    nf.set("explanation", " " + std::to_string(target) + " not found");
    steps.set(idx++, nf);
    return steps;
}
// binary search
val runBinarySearch(val arr, int target) {
    val steps = val::array();
    int len = arr["length"].as<int>(), idx = 0;
    int left = 0, right = len - 1;
    while (left <= right) {
        val r = val::object();
        r.set("type", std::string("range"));
        val ri = val::object(); ri.set("left", left); ri.set("right", right);
        r.set("indices", ri);
        r.set("explanation", "Search range: [" + std::to_string(left) + ", " + std::to_string(right) + "]");
        steps.set(idx++, r);
        int mid = left + (right - left) / 2;
        int mv = arr[mid].as<int>();
        val v = val::object();
        v.set("type", std::string("visit"));
        v.set("index", mid);
        val vi = val::object(); vi.set("left", left); vi.set("right", right); vi.set("mid", mid);
        v.set("indices", vi);
        v.set("explanation", "Mid=" + std::to_string(mid) + " (value=" + std::to_string(mv) + ")");
        steps.set(idx++, v);
        if (mv == target) {
            val f = val::object();
            f.set("type", std::string("found")); f.set("index", mid);
            val fi = val::object(); fi.set("left", left); fi.set("right", right); fi.set("mid", mid);
            f.set("indices", fi);
            f.set("explanation", " Found " + std::to_string(target) + " at index " + std::to_string(mid));
            steps.set(idx++, f);
            return steps;
        }
        val c = val::object();
        c.set("type", std::string("compare")); c.set("index", mid);
        val ci = val::object(); ci.set("left", left); ci.set("right", right); ci.set("mid", mid);
        c.set("indices", ci);
        if (mv < target) {
            c.set("explanation", std::to_string(mv) + " < " + std::to_string(target) + ", search right");
            steps.set(idx++, c); left = mid + 1;
        } else {
            c.set("explanation", std::to_string(mv) + " > " + std::to_string(target) + ", search left");
            steps.set(idx++, c); right = mid - 1;
        }
    }
    val nf = val::object(); nf.set("type", std::string("not_found")); nf.set("index", -1);
    nf.set("indices", val::object()); nf.set("explanation", " " + std::to_string(target) + " not found");
    steps.set(idx++, nf);
    return steps;
}
// dfs
val runDFS(val grid, val start, val end) {
    val steps = val::array(); int si = 0;
    int rows = grid["length"].as<int>(), cols = grid[0]["length"].as<int>();
    int sr = start[0].as<int>(), sc = start[1].as<int>();
    int er = end[0].as<int>(), ec = end[1].as<int>();
    std::vector<std::vector<int>> g(rows, std::vector<int>(cols));
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) g[r][c] = grid[r][c].as<int>();
    std::vector<std::vector<bool>> vis(rows, std::vector<bool>(cols, false));
    std::vector<std::vector<GridPoint>> par(rows, std::vector<GridPoint>(cols, {-1,-1}));
    std::vector<GridPoint> stk; stk.push_back({sr,sc});
    int dx[]={-1,0,1,0}, dy[]={0,1,0,-1};
    val s0=val::object(); s0.set("type",std::string("start")); s0.set("row",sr); s0.set("col",sc);
    s0.set("explanation","DFS from ("+std::to_string(sr)+","+std::to_string(sc)+")");
    steps.set(si++,s0);
    while (!stk.empty()) {
        auto [r,c] = stk.back(); stk.pop_back();
        if (r<0||r>=rows||c<0||c>=cols||vis[r][c]||g[r][c]==1) continue;
        vis[r][c]=true;
        val sv=val::object(); sv.set("type",std::string("visit")); sv.set("row",r); sv.set("col",c);
        sv.set("explanation","Visit ("+std::to_string(r)+","+std::to_string(c)+") stack="+std::to_string(stk.size()));
        steps.set(si++,sv);
        if (r==er&&c==ec) {
            std::vector<GridPoint> path; GridPoint p={r,c};
            while (p.r!=-1){path.insert(path.begin(),p); p=par[p.r][p.c];}
            val pa=val::array();
            for (size_t i=0;i<path.size();i++){
                val pn=val::array(); pn.set(0,path[i].r); pn.set(1,path[i].c); pa.set(i,pn);
                val ps=val::object(); ps.set("type",std::string("path")); ps.set("row",path[i].r); ps.set("col",path[i].c);
                ps.set("explanation","Path step "+std::to_string(i+1)+"/"+std::to_string(path.size()));
                steps.set(si++,ps);
            }
            val f=val::object(); f.set("type",std::string("found")); f.set("row",r); f.set("col",c); f.set("path",pa);
            f.set("explanation"," Path found! Length="+std::to_string(path.size()));
            steps.set(si++,f); return steps;
        }
        for (int i=3;i>=0;i--) {
            int nr=r+dx[i], nc=c+dy[i];
            if (nr>=0&&nr<rows&&nc>=0&&nc<cols&&!vis[nr][nc]&&g[nr][nc]!=1) {
                stk.push_back({nr,nc});
                if (par[nr][nc].r==-1) par[nr][nc]={r,c};
            }
        }
    }
    val nf=val::object(); nf.set("type",std::string("not_found")); nf.set("row",-1); nf.set("col",-1);
    nf.set("explanation"," No path found"); steps.set(si++,nf); return steps;
}
// bfs
val runBFS(val grid, val start, val end) {
    val steps = val::array(); int si = 0;
    int rows = grid["length"].as<int>(), cols = grid[0]["length"].as<int>();
    int sr=start[0].as<int>(), sc=start[1].as<int>();
    int er=end[0].as<int>(), ec=end[1].as<int>();
    std::vector<std::vector<int>> g(rows, std::vector<int>(cols));
    for (int r=0;r<rows;r++) for (int c=0;c<cols;c++) g[r][c]=grid[r][c].as<int>();
    std::vector<std::vector<bool>> vis(rows, std::vector<bool>(cols,false));
    std::vector<std::vector<GridPoint>> par(rows, std::vector<GridPoint>(cols,{-1,-1}));
    std::queue<GridPoint> q; q.push({sr,sc}); vis[sr][sc]=true;
    int dx[]={-1,0,1,0}, dy[]={0,1,0,-1};
    val s0=val::object(); s0.set("type",std::string("start")); s0.set("row",sr); s0.set("col",sc);
    s0.set("explanation","BFS from ("+std::to_string(sr)+","+std::to_string(sc)+")");
    steps.set(si++,s0);
    while (!q.empty()) {
        auto [r,c]=q.front(); q.pop();
        val sv=val::object(); sv.set("type",std::string("visit")); sv.set("row",r); sv.set("col",c);
        sv.set("explanation","Visit ("+std::to_string(r)+","+std::to_string(c)+") queue="+std::to_string(q.size()));
        steps.set(si++,sv);
        if (r==er&&c==ec) {
            std::vector<GridPoint> path; GridPoint p={r,c};
            while (p.r!=-1){path.insert(path.begin(),p); p=par[p.r][p.c];}
            val pa=val::array();
            for (size_t i=0;i<path.size();i++){
                val pn=val::array(); pn.set(0,path[i].r); pn.set(1,path[i].c); pa.set(i,pn);
                val ps=val::object(); ps.set("type",std::string("path")); ps.set("row",path[i].r); ps.set("col",path[i].c);
                ps.set("explanation","Path step "+std::to_string(i+1)+"/"+std::to_string(path.size()));
                steps.set(si++,ps);
            }
            val f=val::object(); f.set("type",std::string("found")); f.set("row",r); f.set("col",c); f.set("path",pa);
            f.set("explanation"," Shortest path found! Length="+std::to_string(path.size()));
            steps.set(si++,f); return steps;
        }
        for (int i=0;i<4;i++){
            int nr=r+dx[i], nc=c+dy[i];
            if (nr>=0&&nr<rows&&nc>=0&&nc<cols&&!vis[nr][nc]&&g[nr][nc]!=1){
                vis[nr][nc]=true; par[nr][nc]={r,c}; q.push({nr,nc});
                val e=val::object(); e.set("type",std::string("enqueue")); e.set("row",nr); e.set("col",nc);
                e.set("explanation","Enqueue ("+std::to_string(nr)+","+std::to_string(nc)+")");
                steps.set(si++,e);
            }
        }
    }
    val nf=val::object(); nf.set("type",std::string("not_found")); nf.set("row",-1); nf.set("col",-1);
    nf.set("explanation"," No path found"); steps.set(si++,nf); return steps;
}
// dijkstra
val runDijkstra(int numNodes, val adjJS, int startNode) {
    val steps = val::array(); int si = 0;
    std::vector<std::vector<std::pair<int,int>>> adj(numNodes);
    for (int u=0;u<numNodes;u++){
        val nb=adjJS[u]; int nl=nb["length"].as<int>();
        for (int j=0;j<nl;j++) adj[u].push_back({nb[j][0].as<int>(), nb[j][1].as<int>()});
    }
    std::vector<int> dist(numNodes, INF), prev(numNodes, -1);
    std::vector<bool> settled(numNodes, false);
    dist[startNode]=0;
    std::vector<std::pair<int,int>> pqSnap; // {dist,node}
    pqSnap.push_back({0, startNode});
    std::priority_queue<std::pair<int,int>,
        std::vector<std::pair<int,int>>, std::greater<>> pq;
    pq.push({0, startNode});
    auto makeDistTable=[&]()->val{
        val t=val::array();
        for (int i=0;i<numNodes;i++){
            val r=val::object(); r.set("node",i);
            r.set("dist", dist[i]==INF?-1:dist[i]);
            r.set("prev", prev[i]); r.set("settled", bool(settled[i]));
            t.set(i,r);
        }
        return t;
    };
    auto makePQ=[&]()->val{
        val a=val::array();
        std::vector<std::pair<int,int>> sorted=pqSnap;
        std::sort(sorted.begin(),sorted.end());
        for (size_t i=0;i<sorted.size();i++){
            val e=val::object(); e.set("node",sorted[i].second); e.set("dist",sorted[i].first);
            a.set(i,e);
        }
        return a;
    };
    val init=val::object(); init.set("type",std::string("init")); init.set("startNode",startNode);
    init.set("distTable",makeDistTable()); init.set("pqState",makePQ());
    init.set("explanation","Init: dist["+std::to_string(startNode)+"]=0, all others=∞");
    steps.set(si++,init);
    while (!pq.empty()){
        auto [d,u]=pq.top(); pq.pop();
        for (auto it=pqSnap.begin();it!=pqSnap.end();++it)
            if (it->second==u&&it->first==d){pqSnap.erase(it);break;}
        if (d>dist[u]||settled[u]) continue;
        settled[u]=true;
        val sv=val::object(); sv.set("type",std::string("settle")); sv.set("node",u);
        sv.set("dist",dist[u]); sv.set("distTable",makeDistTable()); sv.set("pqState",makePQ());
        sv.set("explanation","Settle node "+std::to_string(u)+" (dist="+std::to_string(dist[u])+")");
        steps.set(si++,sv);
        for (auto [v,w]:adj[u]){
            if (settled[v]) continue;
            val ck=val::object(); ck.set("type",std::string("relax_check")); ck.set("fromNode",u);
            ck.set("toNode",v); ck.set("weight",w);
            ck.set("currentDist",dist[v]==INF?-1:dist[v]); ck.set("newDist",dist[u]+w);
            ck.set("distTable",makeDistTable()); ck.set("pqState",makePQ());
            ck.set("explanation","Check edge "+std::to_string(u)+"→"+std::to_string(v)+
                " (w="+std::to_string(w)+") new="+std::to_string(dist[u]+w));
            steps.set(si++,ck);
            if (dist[u]+w<dist[v]){
                dist[v]=dist[u]+w; prev[v]=u;
                bool found=false;
                for (auto& e:pqSnap) if (e.second==v){e.first=dist[v];found=true;break;}
                if (!found) pqSnap.push_back({dist[v],v});
                pq.push({dist[v],v});
                val rx=val::object(); rx.set("type",std::string("relax")); rx.set("fromNode",u);
                rx.set("toNode",v); rx.set("weight",w); rx.set("newDist",dist[v]);
                rx.set("distTable",makeDistTable()); rx.set("pqState",makePQ());
                rx.set("explanation"," Improved dist["+std::to_string(v)+"]="+std::to_string(dist[v])+" via "+std::to_string(u));
                steps.set(si++,rx);
            }
        }
    }
    val distArr=val::array(), prevArr=val::array();
    for (int i=0;i<numNodes;i++){
        distArr.set(i, dist[i]==INF?-1:dist[i]);
        prevArr.set(i, prev[i]);
    }
    val done=val::object(); done.set("type",std::string("done"));
    done.set("distTable",makeDistTable()); done.set("pqState",makePQ());
    done.set("distances",distArr); done.set("prevArray",prevArr);
    done.set("explanation"," Dijkstra complete! All nodes settled.");
    steps.set(si++,done);
    return steps;
}
// kruskal
struct DSU {
    std::vector<int> par, rnk;
    DSU(int n):par(n),rnk(n,0){for(int i=0;i<n;i++)par[i]=i;}
    int find(int x){return par[x]==x?x:par[x]=find(par[x]);}
    bool unite(int x,int y){
        int px=find(x),py=find(y); if(px==py)return false;
        if(rnk[px]<rnk[py])std::swap(px,py);
        par[py]=px; if(rnk[px]==rnk[py])rnk[px]++; return true;
    }
    val snapshot(int n){val a=val::array();for(int i=0;i<n;i++)a.set(i,par[i]);return a;}
};
val runKruskal(int numNodes, val edgesJS) {
    val steps = val::array(); int si = 0;
    int ec = edgesJS["length"].as<int>();
    struct Edge{int u,v,w;};
    std::vector<Edge> edges(ec);
    for (int i=0;i<ec;i++){
        edges[i]={edgesJS[i][0].as<int>(), edgesJS[i][1].as<int>(), edgesJS[i][2].as<int>()};
    }
    std::sort(edges.begin(),edges.end(),[](const Edge&a,const Edge&b){return a.w<b.w;});
    val sortedList=val::array();
    for (int i=0;i<ec;i++){
        val e=val::object(); e.set("u",edges[i].u); e.set("v",edges[i].v); e.set("w",edges[i].w);
        sortedList.set(i,e);
    }
    DSU dsu(numNodes);
    std::vector<Edge> mst;
    int mstCost=0;
    auto makeMST=[&]()->val{
        val a=val::array();
        for (size_t i=0;i<mst.size();i++){
            val e=val::object(); e.set("u",mst[i].u); e.set("v",mst[i].v); e.set("w",mst[i].w);
            a.set(i,e);
        }
        return a;
    };
    val init=val::object(); init.set("type",std::string("init"));
    init.set("sortedEdges",sortedList); init.set("dsuState",dsu.snapshot(numNodes));
    init.set("mstEdges",makeMST()); init.set("mstCost",0);
    init.set("explanation","Kruskal init: "+std::to_string(ec)+" edges sorted by weight");
    steps.set(si++,init);
    for (int i=0;i<ec;i++){
        auto [u,v,w]=std::tie(edges[i].u,edges[i].v,edges[i].w);
        int pu=dsu.find(u), pv=dsu.find(v);
        val ex=val::object(); ex.set("type",std::string("examine")); ex.set("edgeIdx",i);
        ex.set("u",u); ex.set("v",v); ex.set("w",w);
        ex.set("rootU",pu); ex.set("rootV",pv);
        ex.set("sortedEdges",sortedList); ex.set("dsuState",dsu.snapshot(numNodes));
        ex.set("mstEdges",makeMST()); ex.set("mstCost",mstCost);
        ex.set("explanation","Examine ("+std::to_string(u)+"—"+std::to_string(v)+",w="+std::to_string(w)+") root["+std::to_string(u)+"]="+std::to_string(pu)+", root["+std::to_string(v)+"]="+std::to_string(pv));
        steps.set(si++,ex);
        if (dsu.unite(u,v)){
            mst.push_back({u,v,w}); mstCost+=w;
            val ac=val::object(); ac.set("type",std::string("accept")); ac.set("edgeIdx",i);
            ac.set("u",u); ac.set("v",v); ac.set("w",w);
            ac.set("sortedEdges",sortedList); ac.set("dsuState",dsu.snapshot(numNodes));
            ac.set("mstEdges",makeMST()); ac.set("mstCost",mstCost);
            ac.set("explanation"," Accept ("+std::to_string(u)+"—"+std::to_string(v)+",w="+std::to_string(w)+") MST cost="+std::to_string(mstCost));
            steps.set(si++,ac);
            if ((int)mst.size()==numNodes-1) break;
        } else {
            val rj=val::object(); rj.set("type",std::string("reject")); rj.set("edgeIdx",i);
            rj.set("u",u); rj.set("v",v); rj.set("w",w);
            rj.set("sortedEdges",sortedList); rj.set("dsuState",dsu.snapshot(numNodes));
            rj.set("mstEdges",makeMST()); rj.set("mstCost",mstCost);
            rj.set("explanation"," Reject ("+std::to_string(u)+"—"+std::to_string(v)+",w="+std::to_string(w)+") same component, would cycle");
            steps.set(si++,rj);
        }
    }
    val done=val::object(); done.set("type",std::string("done"));
    done.set("sortedEdges",sortedList); done.set("dsuState",dsu.snapshot(numNodes));
    done.set("mstEdges",makeMST()); done.set("mstCost",mstCost);
    done.set("explanation"," Kruskal done! MST cost="+std::to_string(mstCost)+" edges="+std::to_string(mst.size()));
    steps.set(si++,done);
    return steps;
}
// emscripten bindings
EMSCRIPTEN_BINDINGS(algovision) {
    function("runLinearSearch", &runLinearSearch);
    function("runBinarySearch", &runBinarySearch);
    function("runDFS",          &runDFS);
    function("runBFS",          &runBFS);
    function("runDijkstra",     &runDijkstra);
    function("runKruskal",      &runKruskal);
}
