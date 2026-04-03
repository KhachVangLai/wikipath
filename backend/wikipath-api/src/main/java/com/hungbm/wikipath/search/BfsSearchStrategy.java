package com.hungbm.wikipath.search;

import com.hungbm.wikipath.domain.PathResult;
import com.hungbm.wikipath.domain.SearchMetrics;
import com.hungbm.wikipath.integration.wiki.WikiGateway;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class BfsSearchStrategy implements GraphSearchStrategy {

    private final WikiGateway wikiGateway;

    public BfsSearchStrategy(WikiGateway wikiGateway) {
        this.wikiGateway = wikiGateway;
    }

    @Override
    public PathResult search(String source, String target, int maxDepth) {
        long startTime = System.currentTimeMillis();

        if (source.equalsIgnoreCase(target)) {
            long duration = System.currentTimeMillis() - startTime;
            return new PathResult(
                    true,
                    List.of(source),
                    0,
                    new SearchMetrics(0, duration, 0, 0));
        }

        Queue<String> queue = new LinkedList<>();
        Set<String> visited = new HashSet<>();
        Map<String, String> parent = new HashMap<>();
        Map<String, Integer> depthMap = new HashMap<>();

        queue.offer(source);
        visited.add(source);
        depthMap.put(source, 0);

        int expandedNodes = 0;

        while (!queue.isEmpty()) {
            String current = queue.poll();
            int currentDepth = depthMap.get(current);

            if (currentDepth >= maxDepth) {
                continue;
            }

            expandedNodes++;

            List<String> neighbors = wikiGateway.getOutgoingLinks(current);

            for (String neighbor : neighbors) {
                if (visited.contains(neighbor)) {
                    continue;
                }

                visited.add(neighbor);
                parent.put(neighbor, current);
                depthMap.put(neighbor, currentDepth + 1);

                if (neighbor.equalsIgnoreCase(target)) {
                    List<String> path = buildPath(parent, source, neighbor);
                    long duration = System.currentTimeMillis() - startTime;

                    return new PathResult(
                            true,
                            path,
                            path.size() - 1,
                            new SearchMetrics(expandedNodes, duration, 0, 0));
                }

                queue.offer(neighbor);
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        return new PathResult(
                false,
                List.of(),
                -1,
                new SearchMetrics(expandedNodes, duration, 0, 0));
    }

    private List<String> buildPath(Map<String, String> parent, String source, String target) {
        LinkedList<String> path = new LinkedList<>();
        String current = target;

        while (current != null) {
            path.addFirst(current);
            current = parent.get(current);
        }

        if (!path.isEmpty() && path.getFirst().equals(source)) {
            return path;
        }

        return List.of();
    }
}