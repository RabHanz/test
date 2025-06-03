# Analytics API

This API provides endpoints for tracking and retrieving various analytics data.

## Endpoints

### Content Analytics

#### GET /api/analytics/content
Retrieves analytics data for a specific content.

Query Parameters:
- `contentId` (required): The ID of the content to get analytics for
- `startDate` (optional): Start date for filtering data
- `endDate` (optional): End date for filtering data

#### POST /api/analytics/content
Tracks content-related analytics events.

Request Body:
```json
{
  "contentId": "string",
  "type": "string", // One of: "view", "unique_view", "time_on_page", "bounce", "conversion"
  "metadata": {
    // Additional data specific to the event type
  }
}
```

### Performance Metrics

#### GET /api/analytics/performance
Retrieves performance metrics.

Query Parameters:
- `type` (optional): Filter by metric type
- `startDate` (optional): Start date for filtering data
- `endDate` (optional): End date for filtering data

#### POST /api/analytics/performance
Tracks performance metrics.

Request Body:
```json
{
  "type": "string",
  "value": number,
  "metadata": {
    // Additional data specific to the metric
  }
}
```

### User Interactions

#### GET /api/analytics/interactions
Retrieves user interaction data.

Query Parameters:
- `type` (optional): Filter by interaction type
- `userId` (optional): Filter by user ID
- `contentId` (optional): Filter by content ID
- `startDate` (optional): Start date for filtering data
- `endDate` (optional): End date for filtering data

#### POST /api/analytics/interactions
Tracks user interactions.

Request Body:
```json
{
  "type": "string",
  "userId": "string", // Optional
  "contentId": "string", // Optional
  "metadata": {
    // Additional data specific to the interaction
  }
}
```

### Event Tracking

#### POST /api/analytics/track
Tracks general analytics events.

Request Body:
```json
{
  "type": "string",
  "userId": "string", // Optional
  "metadata": {
    // Additional data specific to the event
  }
}
```

## Response Format

All endpoints return responses in the following format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data specific to the endpoint
  }
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## Error Codes

- 400: Bad Request - Missing or invalid parameters
- 404: Not Found - Requested resource not found
- 500: Internal Server Error - Server-side error

## Rate Limiting

API endpoints are rate-limited to prevent abuse. The current limits are:
- 100 requests per minute per IP address
- 1000 requests per hour per IP address

## Authentication

Some endpoints may require authentication. Include the authentication token in the request header:
```
Authorization: Bearer <token>
``` 