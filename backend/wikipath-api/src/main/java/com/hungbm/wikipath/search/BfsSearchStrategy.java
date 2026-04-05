package com.hungbm.wikipath.search;

import com.hungbm.wikipath.domain.PathResult;
import com.hungbm.wikipath.domain.SearchMetrics;
import com.hungbm.wikipath.integration.wiki.WikiGateway;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

        Set<String> forwardFrontier = new LinkedHashSet<>(Set.of(source));
        Set<String> backwardFrontier = new LinkedHashSet<>(Set.of(target));
        Set<String> forwardVisited = new HashSet<>(Set.of(source));
        Set<String> backwardVisited = new HashSet<>(Set.of(target));
        Map<String, String> forwardParent = new HashMap<>();
        Map<String, String> backwardNext = new HashMap<>();
        Map<String, Integer> forwardDepths = new HashMap<>(Map.of(source, 0));
        Map<String, Integer> backwardDepths = new HashMap<>(Map.of(target, 0));

        int expandedNodes = 0;
        int currentForwardDepth = 0;
        int currentBackwardDepth = 0;

        while (!forwardFrontier.isEmpty()
                && !backwardFrontier.isEmpty()
                && currentForwardDepth + currentBackwardDepth < maxDepth) {
            boolean expandForward = shouldExpandForward(forwardFrontier, backwardFrontier);
            LayerExpansion layerExpansion = expandForward
                    ? expandForwardLayer(
                            forwardFrontier,
                            forwardVisited,
                            backwardVisited,
                            forwardParent,
                            forwardDepths,
                            backwardDepths,
                            currentForwardDepth)
                    : expandBackwardLayer(
                            backwardFrontier,
                            forwardVisited,
                            backwardVisited,
                            backwardNext,
                            forwardDepths,
                            backwardDepths,
                            currentBackwardDepth);

            expandedNodes += layerExpansion.expandedNodes();

            if (layerExpansion.meetingNode() != null) {
                List<String> path = buildPath(source, target, layerExpansion.meetingNode(), forwardParent, backwardNext);
                long duration = System.currentTimeMillis() - startTime;

                return new PathResult(
                        true,
                        path,
                        path.size() - 1,
                        new SearchMetrics(expandedNodes, duration, 0, 0));
            }

            if (expandForward) {
                forwardFrontier = layerExpansion.nextFrontier();
                currentForwardDepth++;
            } else {
                backwardFrontier = layerExpansion.nextFrontier();
                currentBackwardDepth++;
            }
        }

        long duration = System.currentTimeMillis() - startTime;
        return new PathResult(
                false,
                List.of(),
                -1,
                new SearchMetrics(expandedNodes, duration, 0, 0));
    }

    private boolean shouldExpandForward(Set<String> forwardFrontier, Set<String> backwardFrontier) {
        return forwardFrontier.size() <= backwardFrontier.size();
    }

    private LayerExpansion expandForwardLayer(
            Set<String> frontier,
            Set<String> forwardVisited,
            Set<String> backwardVisited,
            Map<String, String> forwardParent,
            Map<String, Integer> forwardDepths,
            Map<String, Integer> backwardDepths,
            int currentForwardDepth) {
        Set<String> nextFrontier = new LinkedHashSet<>();
        String bestMeetingNode = null;
        int bestTotalDepth = Integer.MAX_VALUE;
        int expandedNodes = 0;

        for (String current : frontier) {
            expandedNodes++;

            for (String neighbor : wikiGateway.getOutgoingLinks(current)) {
                if (!forwardVisited.add(neighbor)) {
                    continue;
                }

                forwardParent.put(neighbor, current);
                forwardDepths.put(neighbor, currentForwardDepth + 1);

                if (backwardVisited.contains(neighbor)) {
                    int totalDepth = forwardDepths.get(neighbor) + backwardDepths.get(neighbor);
                    if (totalDepth < bestTotalDepth) {
                        bestTotalDepth = totalDepth;
                        bestMeetingNode = neighbor;
                    }
                }

                nextFrontier.add(neighbor);
            }
        }

        return new LayerExpansion(nextFrontier, expandedNodes, bestMeetingNode);
    }

    private LayerExpansion expandBackwardLayer(
            Set<String> frontier,
            Set<String> forwardVisited,
            Set<String> backwardVisited,
            Map<String, String> backwardNext,
            Map<String, Integer> forwardDepths,
            Map<String, Integer> backwardDepths,
            int currentBackwardDepth) {
        Set<String> nextFrontier = new LinkedHashSet<>();
        String bestMeetingNode = null;
        int bestTotalDepth = Integer.MAX_VALUE;
        int expandedNodes = 0;

        for (String current : frontier) {
            expandedNodes++;

            for (String predecessor : wikiGateway.getIncomingLinks(current)) {
                if (!backwardVisited.add(predecessor)) {
                    continue;
                }

                backwardNext.put(predecessor, current);
                backwardDepths.put(predecessor, currentBackwardDepth + 1);

                if (forwardVisited.contains(predecessor)) {
                    int totalDepth = forwardDepths.get(predecessor) + backwardDepths.get(predecessor);
                    if (totalDepth < bestTotalDepth) {
                        bestTotalDepth = totalDepth;
                        bestMeetingNode = predecessor;
                    }
                }

                nextFrontier.add(predecessor);
            }
        }

        return new LayerExpansion(nextFrontier, expandedNodes, bestMeetingNode);
    }

    private List<String> buildPath(
            String source,
            String target,
            String meetingNode,
            Map<String, String> forwardParent,
            Map<String, String> backwardNext) {
        LinkedList<String> path = new LinkedList<>();
        String current = meetingNode;

        while (current != null) {
            path.addFirst(current);
            current = forwardParent.get(current);
        }

        current = backwardNext.get(meetingNode);
        while (current != null) {
            path.addLast(current);
            current = backwardNext.get(current);
        }

        if (!path.isEmpty() && path.getFirst().equals(source) && path.getLast().equals(target)) {
            return path;
        }

        return List.of();
    }

    private record LayerExpansion(
            Set<String> nextFrontier,
            int expandedNodes,
            String meetingNode) {
    }
}
