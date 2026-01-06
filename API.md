# API Documentation

Complete API reference for the Hestia backend service.

## Base URL

```
http://localhost:8001
```

## Authentication

Currently, the API does not require authentication. For production deployments, consider implementing API keys or OAuth.

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Upload endpoints:** 5 requests per minute
- **Analysis endpoints:** 20 requests per minute

Rate limit responses include a `retry_after` field indicating seconds until the limit resets.

## Error Handling

All errors return a JSON response with an `error` field:

```json
{
  "error": "Description of what went wrong"
}
```

HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid input)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## Endpoints

### Health Check

Check if the API is running and properly configured.

**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "healthy",
  "ai_configured": true
}
```

**Status Codes:**
- `200` - Service is healthy

---

### Analyze Lease

Upload and analyze a lease agreement PDF.

**Endpoint:** `POST /api/analyze`

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `file` (required): PDF file (max 10MB)

**Example (curl):**
```bash
curl -X POST http://localhost:8001/api/analyze \
  -F "file=@/path/to/lease.pdf"
```

**Response:**
```json
{
  "key_terms": {
    "rent": "€1,200 per month",
    "deposit": "€1,200",
    "lease_term": "12 months",
    "start_date": "1st January 2024"
  },
  "alerts": [
    {
      "rule_id": "DEP001",
      "title": "Excessive Security Deposit",
      "explanation": "Your deposit is €2,400, which exceeds the legal limit...",
      "severity": "High",
      "recommendation": "Request reduction to one month's rent...",
      "legal_url": "https://www.rtb.ie/..."
    }
  ],
  "missing_clauses": [
    {
      "rule_id": "TER001",
      "title": "Missing: Notice Period",
      "explanation": "Your lease doesn't specify notice periods...",
      "severity": "Medium",
      "recommendation": "Request addition of notice period clause...",
      "legal_url": "https://www.rtb.ie/..."
    }
  ],
  "good_to_know": [
    {
      "title": "Standard Rent Amount",
      "explanation": "Your monthly rent is within normal range..."
    }
  ]
}
```

**Status Codes:**
- `200` - Analysis successful
- `400` - Invalid file or file too large
- `429` - Rate limit exceeded
- `500` - Analysis failed

**Error Responses:**

Invalid file type:
```json
{
  "error": "Invalid file type. Allowed: pdf"
}
```

File too large:
```json
{
  "error": "File too large. Maximum size: 10MB"
}
```

Scanned document:
```json
{
  "key_terms": {
    "note": "This appears to be a scanned document"
  },
  "alerts": [],
  "missing_clauses": [],
  "good_to_know": [
    {
      "title": "Scanned Document Detected",
      "explanation": "Your PDF appears to be a scanned document..."
    }
  ]
}
```

---

### Check Rent Fairness

Analyze if a rent price is fair and legal for a given address.

**Endpoint:** `POST /api/check-rent`

**Request:**
- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "address": "123 Main Street, Dublin 8",
    "rent": 1500,
    "property_type": "apartment",
    "bedrooms": 2
  }
  ```

**Fields:**
- `address` (required, string): Full property address
- `rent` (required, number): Monthly rent in euros
- `property_type` (optional, string): "house" or "apartment"
- `bedrooms` (optional, number): Number of bedrooms

**Example (curl):**
```bash
curl -X POST http://localhost:8001/api/check-rent \
  -H "Content-Type: application/json" \
  -d '{
    "address": "123 Ranelagh, Dublin",
    "rent": 2000,
    "bedrooms": 2
  }'
```

**Response:**
```json
{
  "is_rpz": true,
  "legal_assessment": {
    "is_legal": true,
    "explanation": "This property is in a Rent Pressure Zone. The rent appears to comply with RPZ regulations..."
  },
  "rent_assessment": {
    "assessment": "average",
    "confidence": 85,
    "explanation": "Based on comparable properties in the area, this rent is within the average range..."
  }
}
```

**Fields:**
- `is_rpz` (boolean): Whether the address is in a Rent Pressure Zone
- `legal_assessment`:
  - `is_legal` (boolean): Whether the rent complies with RPZ rules
  - `explanation` (string): Detailed legal assessment
- `rent_assessment`:
  - `assessment` (string): "high", "average", or "low"
  - `confidence` (number): Confidence score (0-100)
  - `explanation` (string): Market analysis

**Status Codes:**
- `200` - Analysis successful
- `400` - Missing or invalid fields
- `429` - Rate limit exceeded
- `500` - Analysis failed

**Error Responses:**

Missing fields:
```json
{
  "error": "Missing required fields: address, rent"
}
```

Invalid rent:
```json
{
  "error": "Invalid input: Rent must be greater than zero"
}
```

---

### Generate Repair Request

Generate a professional repair request email.

**Endpoint:** `POST /api/generate-repair-request`

**Request:**
- **Content-Type:** `application/json`
- **Body:**
  ```json
  {
    "issue_type": "heating",
    "details": "The boiler has stopped working and there's no hot water for 3 days now."
  }
  ```

**Fields:**
- `issue_type` (required, string): One of:
  - `hot_water`
  - `heating`
  - `leak`
  - `electrical`
  - `appliance`
  - `mold`
  - `structural`
  - `pest`
  - `other`
- `details` (optional, string): Additional information about the issue (max 5000 characters)

**Example (curl):**
```bash
curl -X POST http://localhost:8001/api/generate-repair-request \
  -H "Content-Type: application/json" \
  -d '{
    "issue_type": "heating",
    "details": "Boiler not working, no hot water for 3 days."
  }'
```

**Response:**
```json
{
  "subject": "Urgent: Heating System Repair Required",
  "message": "Dear Landlord,\n\nI am writing to request an urgent repair to the heating system in my rented property...\n\nI would appreciate if you could arrange for a qualified heating engineer to inspect and repair the boiler at your earliest convenience.\n\nThank you for your prompt attention to this matter.\n\nSincerely,\n[Your Name]"
}
```

**Status Codes:**
- `200` - Email generated successfully
- `400` - Missing or invalid fields
- `429` - Rate limit exceeded
- `500` - Generation failed

**Error Responses:**

Invalid issue type:
```json
{
  "error": "Invalid issue type. Must be one of: hot_water, heating, leak, electrical, appliance, mold, structural, pest, other"
}
```

Details too long:
```json
{
  "error": "Invalid input: Details too long (max 5000 characters)"
}
```

---

### Analyze Deposit Dispute

Analyze a photo of alleged damage for a deposit dispute.

**Endpoint:** `POST /api/analyze-dispute`

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `image` (required): Image file (JPG, PNG, max 10MB)
  - `description` (required): Landlord's damage description
  - `deduction_amount` (required): Amount being deducted (e.g., "200" or "€200")

**Example (curl):**
```bash
curl -X POST http://localhost:8001/api/analyze-dispute \
  -F "image=@/path/to/photo.jpg" \
  -F "description=Damage to wall" \
  -F "deduction_amount=200"
```

**Response:**
```json
{
  "analysis": "The image shows minor scuff marks on the wall, typical of normal use over time. This appears to be ordinary wear and tear rather than tenant-caused damage.",
  "arguments": [
    "The marks are consistent with normal furniture contact over the course of a tenancy",
    "No evidence of deliberate damage or negligence",
    "Under Irish law, landlords cannot charge for normal wear and tear",
    "The property inventory should show the condition at move-in for comparison",
    "Request evidence that this damage exceeds normal wear and tear"
  ],
  "wear_and_tear_classification": true,
  "estimated_fair_deduction": "€0"
}
```

**Fields:**
- `analysis` (string): AI's assessment of the damage
- `arguments` (array): 3-5 dispute arguments for the tenant
- `wear_and_tear_classification` (boolean): True if normal wear and tear
- `estimated_fair_deduction` (string): Recommended deduction amount

**Status Codes:**
- `200` - Analysis successful
- `400` - Missing fields or invalid file
- `429` - Rate limit exceeded
- `500` - Analysis failed

**Error Responses:**

Invalid file type:
```json
{
  "error": "Only JPG and PNG images are allowed"
}
```

Missing fields:
```json
{
  "error": "No image provided"
}
```

---

## Data Types

### Severity Levels

Used in `alerts` and `missing_clauses`:
- `High`: Serious legal issue or missing critical clause
- `Medium`: Moderate concern
- `Low`: Minor issue or informational

### RPZ Areas

Rent Pressure Zones include:
- **Full coverage:** Dublin, Kildare, Louth, Meath, Wicklow, Galway (city and county), Kilkenny, Limerick, Waterford, Westmeath
- **Partial coverage:** Cork (specific areas), Clare (Ennis, Shannon), Kerry (Killarney), and others

See `backend/app/rent_checker.py` for the complete list.

## Rate Limit Headers

Rate-limited responses include:

```json
{
  "error": "Too many requests. Please try again later.",
  "retry_after": 45
}
```

Where `retry_after` is seconds until the rate limit resets.

## Best Practices

### File Uploads

1. **Validate file size client-side** before uploading
2. **Check file extension** (.pdf for leases, .jpg/.png for images)
3. **Handle scanned documents** - inform users they need text-based PDFs

### Error Handling

Always handle these scenarios:
- Network errors (timeout, connection refused)
- Invalid responses (non-JSON)
- Rate limiting (implement exponential backoff)
- Service unavailable (API key issues)

Example JavaScript:
```javascript
async function analyzeLease(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('http://localhost:8001/api/analyze', {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limited - retry after delay
        const retryAfter = data.retry_after || 60;
        throw new Error(`Rate limited. Retry after ${retryAfter}s`);
      }
      throw new Error(data.error || 'Analysis failed');
    }

    return data;
  } catch (error) {
    console.error('Error analyzing lease:', error);
    throw error;
  }
}
```

### Performance

1. **Show loading states** during AI operations (can take 2-5 seconds)
2. **Implement timeout handling** (set timeout to 30+ seconds)
3. **Cache results** when appropriate (same file analyzed multiple times)

## Webhook Support (Future)

Future versions may support webhooks for long-running operations:

```json
POST /api/analyze
{
  "file": "...",
  "webhook_url": "https://your-app.com/webhook"
}
```

Response:
```json
{
  "job_id": "abc123",
  "status": "processing"
}
```

Webhook callback:
```json
POST https://your-app.com/webhook
{
  "job_id": "abc123",
  "status": "completed",
  "result": { /* analysis result */ }
}
```

## Support

- **GitHub Issues:** Report bugs or request features
- **Documentation:** See [README.md](./README.md) and [INTERVIEW_NOTES.md](./INTERVIEW_NOTES.md)
- **RTB Resources:** https://www.rtb.ie for Irish tenancy law
