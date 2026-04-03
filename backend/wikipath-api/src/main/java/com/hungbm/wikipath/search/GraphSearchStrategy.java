package com.hungbm.wikipath.search;

import com.hungbm.wikipath.domain.PathResult;

public interface GraphSearchStrategy {
    PathResult search(String source, String target, int maxDepth);
}