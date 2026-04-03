package com.hungbm.wikipath.service;

import com.hungbm.wikipath.domain.PathResult;
import com.hungbm.wikipath.search.GraphSearchStrategy;
import org.springframework.stereotype.Service;

@Service
public class PathService {

    private final GraphSearchStrategy graphSearchStrategy;

    public PathService(GraphSearchStrategy graphSearchStrategy) {
        this.graphSearchStrategy = graphSearchStrategy;
    }

    public PathResult searchPath(String source, String target, int maxDepth) {
        return graphSearchStrategy.search(source, target, maxDepth);
    }
}