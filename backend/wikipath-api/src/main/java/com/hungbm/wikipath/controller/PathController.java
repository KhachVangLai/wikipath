package com.hungbm.wikipath.controller;

import com.hungbm.wikipath.domain.PathResult;
import com.hungbm.wikipath.domain.SearchMetrics;
import com.hungbm.wikipath.dto.PathResponse;
import com.hungbm.wikipath.service.PathService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class PathController {

    private final PathService pathService;

    public PathController(PathService pathService) {
        this.pathService = pathService;
    }

    @GetMapping("/path")
    public PathResponse searchPath(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(defaultValue = "6") int maxDepth) {
        PathResult result = pathService.searchPath(from, to, maxDepth);
        SearchMetrics metrics = result.metrics();

        return new PathResponse(
                from,
                to,
                result.found(),
                result.depth(),
                result.path(),
                new PathResponse.MetricsResponse(
                        metrics.expandedNodes(),
                        metrics.durationMs(),
                        metrics.cacheHits(),
                        metrics.cacheMisses()));
    }
}