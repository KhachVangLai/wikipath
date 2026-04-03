package com.hungbm.wikipath.service;

import com.hungbm.wikipath.domain.PathResult;
import com.hungbm.wikipath.exception.InvalidInputException;
import com.hungbm.wikipath.search.GraphSearchStrategy;
import com.hungbm.wikipath.util.TitleNormalizer;

import org.springframework.stereotype.Service;

@Service
public class PathService {

    private final GraphSearchStrategy graphSearchStrategy;

    public PathService(GraphSearchStrategy graphSearchStrategy) {
        this.graphSearchStrategy = graphSearchStrategy;
    }

    public PathResult searchPath(String source, String target, int maxDepth) {
        String normalizedSource = TitleNormalizer.normalizeRequired(source, "from");
        String normalizedTarget = TitleNormalizer.normalizeRequired(target, "to");
        if (maxDepth < 1 || maxDepth > 6) {
            throw new InvalidInputException("maxDepth must be between 1 and 6");
        }
        return graphSearchStrategy.search(normalizedSource, normalizedTarget, maxDepth);
    }
}