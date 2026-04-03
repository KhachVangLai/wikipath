package com.hungbm.wikipath.integration.wiki;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Component
public class MediaWikiClient implements WikiGateway {

    private static final String BASE_URL = "https://en.wikipedia.org";
    private static final String API_PATH = "/w/api.php";

    private final RestClient restClient;
    private final JsonMapper jsonMapper;

    public MediaWikiClient(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
        this.restClient = RestClient.builder()
                .baseUrl(BASE_URL)
                .defaultHeader(
                        HttpHeaders.USER_AGENT,
                        "WikiPath/0.1 (student project; contact: hungbm918@gmail.com)")
                .build();
    }

    @Override
    public List<String> suggestTitles(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        try {
            String body = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path(API_PATH)
                            .queryParam("action", "query")
                            .queryParam("format", "json")
                            .queryParam("list", "search")
                            .queryParam("srsearch", query.trim())
                            .queryParam("srwhat", "title")
                            .queryParam("srlimit", 5)
                            .build())
                    .retrieve()
                    .body(String.class);

            JsonNode root = jsonMapper.readTree(body);
            JsonNode searchResults = root.path("query").path("search");

            List<String> titles = new ArrayList<>();
            if (searchResults.isArray()) {
                for (JsonNode item : searchResults) {
                    String title = item.path("title").asString();
                    if (!title.isBlank()) {
                        titles.add(title);
                    }
                }
            }

            return titles;
        } catch (Exception e) {
            throw new IllegalStateException("Failed to fetch title suggestions from Wikipedia", e);
        }
    }

    @Override
    public List<String> getOutgoingLinks(String title) {
        if (title == null || title.isBlank()) {
            return List.of();
        }

        try {
            Set<String> links = new LinkedHashSet<>();
            String plcontinue = null;

            do {
                String currentContinue = plcontinue;

                String body = restClient.get()
                        .uri(uriBuilder -> {
                            var builder = uriBuilder
                                    .path(API_PATH)
                                    .queryParam("action", "query")
                                    .queryParam("format", "json")
                                    .queryParam("titles", title.trim())
                                    .queryParam("prop", "links")
                                    .queryParam("plnamespace", 0)
                                    .queryParam("pllimit", "max");

                            if (currentContinue != null && !currentContinue.isBlank()) {
                                builder.queryParam("plcontinue", currentContinue);
                            }

                            return builder.build();
                        })
                        .retrieve()
                        .body(String.class);

                JsonNode root = jsonMapper.readTree(body);
                JsonNode pagesNode = root.path("query").path("pages");

                Iterator<JsonNode> pages = pagesNode.iterator();
                if (pages.hasNext()) {
                    JsonNode page = pages.next();
                    JsonNode linksNode = page.path("links");

                    if (linksNode.isArray()) {
                        for (JsonNode linkNode : linksNode) {
                            String linkedTitle = linkNode.path("title").asString();
                            if (!linkedTitle.isBlank()) {
                                links.add(linkedTitle);
                            }
                        }
                    }
                }

                JsonNode continueNode = root.path("continue");
                if (continueNode.has("plcontinue")) {
                    plcontinue = continueNode.path("plcontinue").asString();
                } else {
                    plcontinue = null;
                }

            } while (plcontinue != null);

            return new ArrayList<>(links);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to fetch outgoing links from Wikipedia", e);
        }
    }
}