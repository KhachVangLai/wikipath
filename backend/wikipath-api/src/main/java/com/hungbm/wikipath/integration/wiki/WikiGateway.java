package com.hungbm.wikipath.integration.wiki;

import java.util.List;

public interface WikiGateway {
    List<String> suggestTitles(String query);
}
