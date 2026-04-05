package com.hungbm.wikipath.search;

import com.hungbm.wikipath.domain.PathResult;
import com.hungbm.wikipath.integration.wiki.WikiGateway;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BfsSearchStrategyTest {

    @Test
    void shouldFindShortestPathUsingForwardAndBackwardFrontiers() {
        TestWikiGateway wikiGateway = new TestWikiGateway();
        wikiGateway.connect("Gemini", "Alphabet Inc.");
        wikiGateway.connect("Alphabet Inc.", "OpenAI");
        wikiGateway.connect("Gemini", "Zodiac");
        wikiGateway.connect("Zodiac", "Astronomy");

        BfsSearchStrategy strategy = new BfsSearchStrategy(wikiGateway);

        PathResult result = strategy.search("Gemini", "OpenAI", 4);

        assertTrue(result.found());
        assertEquals(List.of("Gemini", "Alphabet Inc.", "OpenAI"), result.path());
        assertEquals(2, result.depth());
        assertTrue(wikiGateway.incomingCalls > 0);
    }

    @Test
    void shouldRespectMaxDepthLimit() {
        TestWikiGateway wikiGateway = new TestWikiGateway();
        wikiGateway.connect("A", "B");
        wikiGateway.connect("B", "C");

        BfsSearchStrategy strategy = new BfsSearchStrategy(wikiGateway);

        PathResult result = strategy.search("A", "C", 1);

        assertFalse(result.found());
        assertEquals(List.of(), result.path());
        assertEquals(-1, result.depth());
    }

    private static final class TestWikiGateway implements WikiGateway {
        private final Map<String, List<String>> outgoingLinks = new HashMap<>();
        private final Map<String, List<String>> incomingLinks = new HashMap<>();
        private int incomingCalls = 0;

        void connect(String from, String to) {
            outgoingLinks.merge(from, List.of(to), this::append);
            incomingLinks.merge(to, List.of(from), this::append);
        }

        @Override
        public List<String> suggestTitles(String query) {
            return List.of();
        }

        @Override
        public List<String> getOutgoingLinks(String title) {
            return outgoingLinks.getOrDefault(title, List.of());
        }

        @Override
        public List<String> getIncomingLinks(String title) {
            incomingCalls++;
            return incomingLinks.getOrDefault(title, List.of());
        }

        private List<String> append(List<String> existingValues, List<String> newValues) {
            return java.util.stream.Stream.concat(existingValues.stream(), newValues.stream()).toList();
        }
    }
}
