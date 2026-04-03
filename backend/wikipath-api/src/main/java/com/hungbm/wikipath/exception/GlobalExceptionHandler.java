package com.hungbm.wikipath.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidInputException.class)
    public ResponseEntity<ErrorResponse> handleInvalidInput(InvalidInputException ex) {
        return ResponseEntity.badRequest().body(
                new ErrorResponse(
                        "INVALID_INPUT",
                        ex.getMessage(),
                        Instant.now()));
    }

    @ExceptionHandler(ExternalApiException.class)
    public ResponseEntity<ErrorResponse> handleExternalApi(ExternalApiException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(
                new ErrorResponse(
                        "EXTERNAL_API_ERROR",
                        ex.getMessage(),
                        Instant.now()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                new ErrorResponse(
                        "INTERNAL_SERVER_ERROR",
                        "Unexpected server error",
                        Instant.now()));
    }
}