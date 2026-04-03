# Architecture Tree

controller/: REST endpoints
service/: Business logic
client/: Call External API client (Wikipedia API)
dto/: request/response objects
domain/: Domain entities (PathResult, SearchMetrics)
exception/: Custom exceptions + global handler
util/: Utility classes (normalize title, etc)
