package com.hungbm.wikipath.exception;

import java.time.Instant;

public record ErrorResponse(
        String code,
        String message,
        Instant timestamp) {
}