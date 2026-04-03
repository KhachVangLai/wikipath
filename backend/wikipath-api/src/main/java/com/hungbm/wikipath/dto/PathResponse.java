package com.hungbm.wikipath.dto;

import java.util.List;

public record PathResponse(
        String from,
        String to,
        boolean found,
        int depth,
        List<String> path,
        MetricsResponse metrics) {
    public record MetricsResponse(
            int expandedNodes,
            long durationMs,
            int cacheHits,
            int cacheMisses) {
    }
}