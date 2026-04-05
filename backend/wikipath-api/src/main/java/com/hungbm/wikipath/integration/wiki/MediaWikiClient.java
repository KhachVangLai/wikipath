package com.hungbm.wikipath.integration.wiki;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.web.util.UriBuilder;

import com.hungbm.wikipath.exception.ExternalApiException;

import java.net.URI;
import java.net.http.HttpClient;
import java.time.Duration;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.function.Function;

@Component
public class MediaWikiClient implements WikiGateway {

    private static final String BASE_URL = "https://en.wikipedia.org";
    private static final String API_PATH = "/w/api.php";
    private static final Duration CONNECT_TIMEOUT = Duration.ofSeconds(5);
    private static final Duration READ_TIMEOUT = Duration.ofSeconds(15);
    private static final int MAX_ATTEMPTS = 3;
    private static final long BASE_BACKOFF_MILLIS = 400L;

    private final RestClient restClient;
    private final JsonMapper jsonMapper;

    public MediaWikiClient(JsonMapper jsonMapper) {
        this.jsonMapper = jsonMapper;
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(CONNECT_TIMEOUT)
                .build();
        JdkClientHttpRequestFactory requestFactory = new JdkClientHttpRequestFactory(httpClient);
        requestFactory.setReadTimeout(READ_TIMEOUT);
        this.restClient = RestClient.builder()
                .baseUrl(BASE_URL)
                .requestFactory(requestFactory)
                .defaultHeader(
                        HttpHeaders.USER_AGENT,
                        "WikiPath/0.1 (portfolio demo application)")
                .build();
    }

    @Cacheable(cacheNames = "wikiSuggestions", key = "#query.trim().toLowerCase()")
    @Override
    public List<String> suggestTitles(String query) {
        if (query == null || query.isBlank()) {
            return List.of();
        }

        String failureMessage = "Failed to fetch title suggestions from Wikipedia";
        String body = executeGet(
                uriBuilder -> uriBuilder
                        .path(API_PATH)
                        .queryParam("action", "query")
                        .queryParam("format", "json")
                        .queryParam("list", "prefixsearch")
                        .queryParam("pssearch", query.trim())
                        .queryParam("pslimit", 5)
                        .build(),
                failureMessage);

        JsonNode root = readJson(body, failureMessage);
        ensureWikipediaSuccess(root, failureMessage);
        JsonNode itemsNode = root.path("query").path("prefixsearch");

        List<String> titles = new ArrayList<>();
        if (itemsNode.isArray()) {
            for (JsonNode item : itemsNode) {
                String title = item.path("title").asString();
                if (!title.isBlank()) {
                    titles.add(title);
                }
            }
        }

        return titles;
    }

    @Cacheable(cacheNames = "wikiOutgoingLinks", key = "#title.trim().toLowerCase()")
    @Override
    public List<String> getOutgoingLinks(String title) {
        if (title == null || title.isBlank()) {
            return List.of();
        }

        String failureMessage = "Failed to fetch outgoing links from Wikipedia";
        Set<String> links = new LinkedHashSet<>();
        String plcontinue = null;

        do {
            String currentContinue = plcontinue;
            String body = executeGet(
                    uriBuilder -> {
                        UriBuilder builder = uriBuilder
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
                    },
                    failureMessage);

            JsonNode root = readJson(body, failureMessage);
            ensureWikipediaSuccess(root, failureMessage);
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
    }

    @Cacheable(cacheNames = "wikiIncomingLinks", key = "#title.trim().toLowerCase()")
    @Override
    public List<String> getIncomingLinks(String title) {
        if (title == null || title.isBlank()) {
            return List.of();
        }

        String failureMessage = "Failed to fetch incoming links from Wikipedia";
        Set<String> links = new LinkedHashSet<>();
        String blcontinue = null;

        do {
            String currentContinue = blcontinue;
            String body = executeGet(
                    uriBuilder -> {
                        UriBuilder builder = uriBuilder
                                .path(API_PATH)
                                .queryParam("action", "query")
                                .queryParam("format", "json")
                                .queryParam("list", "backlinks")
                                .queryParam("bltitle", title.trim())
                                .queryParam("blnamespace", 0)
                                .queryParam("bllimit", "max");

                        if (currentContinue != null && !currentContinue.isBlank()) {
                            builder.queryParam("blcontinue", currentContinue);
                        }

                        return builder.build();
                    },
                    failureMessage);

            JsonNode root = readJson(body, failureMessage);
            ensureWikipediaSuccess(root, failureMessage);
            JsonNode backlinksNode = root.path("query").path("backlinks");

            if (backlinksNode.isArray()) {
                for (JsonNode backlinkNode : backlinksNode) {
                    String linkedTitle = backlinkNode.path("title").asString();
                    if (!linkedTitle.isBlank()) {
                        links.add(linkedTitle);
                    }
                }
            }

            JsonNode continueNode = root.path("continue");
            if (continueNode.has("blcontinue")) {
                blcontinue = continueNode.path("blcontinue").asString();
            } else {
                blcontinue = null;
            }

        } while (blcontinue != null);

        return new ArrayList<>(links);
    }

    private String executeGet(Function<UriBuilder, URI> uriBuilderFunction, String failureMessage) {
        for (int attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            try {
                String responseBody = restClient.get()
                        .uri(uriBuilderFunction)
                        .retrieve()
                        .body(String.class);

                if (responseBody == null || responseBody.isBlank()) {
                    throw new ExternalApiException(failureMessage, null);
                }

                return responseBody;
            } catch (RestClientResponseException ex) {
                if (attempt < MAX_ATTEMPTS && isRetriableStatus(ex.getStatusCode().value())) {
                    pauseBeforeRetry(attempt, ex.getResponseHeaders());
                    continue;
                }

                throw new ExternalApiException(failureMessage, ex);
            } catch (ResourceAccessException ex) {
                if (attempt < MAX_ATTEMPTS) {
                    pauseBeforeRetry(attempt, null);
                    continue;
                }

                throw new ExternalApiException(failureMessage, ex);
            } catch (ExternalApiException ex) {
                throw ex;
            } catch (Exception ex) {
                throw new ExternalApiException(failureMessage, ex);
            }
        }

        throw new ExternalApiException(failureMessage, null);
    }

    private JsonNode readJson(String body, String failureMessage) {
        try {
            return jsonMapper.readTree(body);
        } catch (Exception ex) {
            throw new ExternalApiException(failureMessage, ex);
        }
    }

    private void ensureWikipediaSuccess(JsonNode root, String failureMessage) {
        JsonNode errorNode = root.path("error");
        if (errorNode.isMissingNode()) {
            return;
        }

        String info = errorNode.path("info").asText();
        String code = errorNode.path("code").asText();
        String message = failureMessage;

        if (!info.isBlank() || !code.isBlank()) {
            message = failureMessage + ": " + (info.isBlank() ? code : info);
        }

        throw new ExternalApiException(message, null);
    }

    private boolean isRetriableStatus(int statusCode) {
        return statusCode == 429 || statusCode >= 500;
    }

    private void pauseBeforeRetry(int attempt, HttpHeaders responseHeaders) {
        long backoffMillis = resolveRetryDelay(attempt, responseHeaders);

        try {
            Thread.sleep(backoffMillis);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new ExternalApiException("Wikipedia retry was interrupted", ex);
        }
    }

    private long resolveRetryDelay(int attempt, HttpHeaders responseHeaders) {
        if (responseHeaders != null) {
            String retryAfter = responseHeaders.getFirst(HttpHeaders.RETRY_AFTER);
            if (retryAfter != null && !retryAfter.isBlank()) {
                try {
                    return Math.max(Long.parseLong(retryAfter) * 1000L, BASE_BACKOFF_MILLIS);
                } catch (NumberFormatException ignored) {
                    // Fall back to exponential backoff when Retry-After is not a plain second count.
                }
            }
        }

        return BASE_BACKOFF_MILLIS * attempt;
    }
}
