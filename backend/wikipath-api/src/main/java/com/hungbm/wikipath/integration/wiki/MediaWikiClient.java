package com.hungbm.wikipath.integration.wiki;

import java.util.List;

import org.springframework.stereotype.Component;

@Component
public class MediaWikiClient implements WikiGateway {

    @Override
    public List<String> suggestTitles(String query) {
        // TODO: implement real Wikipedia API Call
        return List.of();
    }

    @Override
    public List<String> getOutgoingLinks(String title) {
        return List.of();
    }

}
