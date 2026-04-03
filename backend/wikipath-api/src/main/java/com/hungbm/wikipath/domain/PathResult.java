package com.hungbm.wikipath.domain;

import java.util.List;

public record PathResult(
        boolean found,
        List<String> path,
        int depth,
        SearchMetrics metrics) {
}