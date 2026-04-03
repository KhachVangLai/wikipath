package com.hungbm.wikipath.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.hungbm.wikipath.integration.wiki.WikiGateway;

@Service
public class PageSuggestionService {
    private final WikiGateway wikiGateway;

    public PageSuggestionService(WikiGateway wikiGateway) {
        this.wikiGateway = wikiGateway;
    }

    public List<String> suggestTitles(String query) {
        return wikiGateway.suggestTitles(query);
    }

}
