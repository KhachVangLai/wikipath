package com.hungbm.wikipath.util;

import com.hungbm.wikipath.exception.InvalidInputException;

public final class TitleNormalizer {

    private TitleNormalizer() {
    }

    public static String normalizeRequired(String value, String fieldName) {
        if (value == null) {
            throw new InvalidInputException(fieldName + " is required");
        }

        String normalized = value.trim().replaceAll("\\s+", " ");

        if (normalized.isBlank()) {
            throw new InvalidInputException(fieldName + " must not be blank");
        }

        return normalized;
    }
}