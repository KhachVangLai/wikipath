package com.hungbm.wikipath.domain;

public record SearchMetrics(
        int expandedNodes,
        long durationMs,
        int cacheHits,
        int cacheMisses) {
}