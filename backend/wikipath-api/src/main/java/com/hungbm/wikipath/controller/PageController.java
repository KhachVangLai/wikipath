package com.hungbm.wikipath.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.hungbm.wikipath.dto.SuggestResponse;
import com.hungbm.wikipath.service.PageSuggestionService;

@RestController
@RequestMapping("/api/v1/pages")
public class PageController {
    private final PageSuggestionService pageSuggestionService;

    public PageController(PageSuggestionService pageSuggestionService) {
        this.pageSuggestionService = pageSuggestionService;
    }

    @GetMapping("/suggest")
    public SuggestResponse suggest(@RequestParam String q) {
        return new SuggestResponse(pageSuggestionService.suggestTitles(q));
    }
}
