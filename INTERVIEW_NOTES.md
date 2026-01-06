# Hestia - Interview Ready Notes

## Project Overview

**Hestia** is an AI-powered tenant advocacy platform designed specifically for Irish renters. It provides legal guidance and analysis tools to help tenants understand their rights, navigate disputes, and ensure fair treatment under Irish rental law.

**Tagline:** "Helping Irish Tenants Understand Their Rights"

### Problem Statement
Many Irish tenants face challenges understanding complex rental agreements, knowing their legal rights, and navigating disputes with landlords. Legal advice is expensive and often inaccessible to those who need it most. Hestia democratizes access to legal information by using AI to analyze documents and provide actionable guidance.

### Key Value Proposition
- **Instant Analysis:** Upload a lease and get immediate legal analysis
- **Plain Language:** Explains complex legal terms in simple, everyday language
- **Evidence-Based:** Uses structured knowledge base of Irish tenancy laws
- **Actionable Guidance:** Provides specific recommendations, not just information

---

## Core Features

### 1. **Lease Analyzer**
**Purpose:** Analyzes rental agreements for legal issues and unfair terms

**How it works:**
- User uploads PDF lease agreement
- System extracts text using PyPDF2
- Gemini 2.0 Flash AI analyzes against Irish tenancy law knowledge base
- Returns analysis with three sections:
  - **Key Terms:** Rent, deposit, lease term, start date (extracted)
  - **Alerts:** Legal violations with severity ratings (High/Medium/Low)
  - **Missing Clauses:** Important protections absent from the lease
  - **Good to Know:** Standard compliant clauses explained

**Technical Implementation:**
- Backend: Flask endpoint `/api/analyze`
- AI Model: Google Gemini 2.0 Flash
- Knowledge Base: 7 JSON rule files covering deposits, rent, repairs, termination, privacy, etc.
- Text Extraction: PyPDF2 library
- Response Format: Structured JSON with severity ratings and legal URLs

**Key Innovation:**
- Dual-layer analysis: AI interprets the lease PLUS rule-based missing clause detection
- Links to official RTB (Residential Tenancies Board) resources for each issue

### 2. **Fair Rent Checker**
**Purpose:** Determines if rent is fair and legal based on location and market rates

**How it works:**
- User enters address and proposed rent
- System checks if property is in a Rent Pressure Zone (RPZ)
- For RPZs: Validates against 2% annual increase cap and HICP regulations
- Compares rent to comparable listings in the area
- Returns legal and market assessments

**Technical Implementation:**
- Backend: Flask endpoint `/api/check-rent`
- RPZ Detection: Custom algorithm using Eircode routing keys and area matching
- Mock Comparables: Currently generates sample data (ready for API integration)
- AI Analysis: Gemini 2.0 Flash evaluates legality and market positioning

**RPZ Coverage:**
- Full coverage: Dublin, Kildare, Louth, Meath, Wicklow, Galway, etc.
- Partial coverage: Cork, Clare, Kerry (specific electoral areas)
- 90+ Dublin area names recognized

### 3. **Repair Request Assistant**
**Purpose:** Generates professional repair request letters citing relevant Irish housing standards

**How it works:**
- User selects issue type (plumbing, heating, electrical, structural, etc.)
- Provides details about the problem
- AI generates formal letter referencing Housing Standards Regulations 2019
- Letter includes legal obligations, timelines, and tenant rights

**Technical Implementation:**
- Backend: Flask endpoint `/api/generate-repair-request`
- AI Model: Gemini 2.0 Flash with structured prompt
- Output: Professional email template ready to send to landlord

### 4. **Deposit Dispute Kit**
**Purpose:** Analyzes damage photos to build arguments against unfair deposit deductions

**How it works:**
- User uploads photo of alleged damage
- Provides landlord's description and deduction amount
- AI uses multimodal vision capabilities to analyze the image
- Returns: Assessment of wear-and-tear vs. damage, dispute arguments, fair deduction estimate

**Technical Implementation:**
- Backend: Flask endpoint `/api/analyze-dispute`
- AI Model: Gemini 2.0 Flash (multimodal - text + image)
- Image Processing: Base64 encoding for API transmission
- Legal Context: Defines "normal wear and tear" per Irish law

**Key Feature:**
- Distinguishes between normal wear-and-tear (not chargeable) and actual damage
- Provides 3-5 specific arguments for RTB dispute resolution

---

## Technical Architecture

### Tech Stack

**Frontend:**
- **Framework:** Next.js 14.1.0 (React 18.2.0)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **File Upload:** react-dropzone
- **Icons:** Heroicons, Lucide React

**Backend:**
- **Framework:** Flask (Python)
- **AI Integration:** Google Generative AI (gemini-2.0-flash)
- **PDF Processing:** PyPDF2
- **Environment:** Python 3.8+

**Deployment:**
- Frontend: Port 3002 (Next.js dev server)
- Backend: Port 8001 (Flask server)
- Concurrent Execution: npm-run-all/concurrently

### System Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Next.js   │  HTTP   │    Flask     │   API   │   Gemini    │
│   Frontend  │────────▶│   Backend    │────────▶│  2.0 Flash  │
│  (Port 3002)│         │  (Port 8001) │         │             │
└─────────────┘         └──────────────┘         └─────────────┘
                               │
                               ▼
                        ┌──────────────┐
                        │  Knowledge   │
                        │     Base     │
                        │  (JSON Rules)│
                        └──────────────┘
```

### API Endpoints

1. **GET /health** - Health check endpoint
2. **POST /api/analyze** - Lease analysis (accepts PDF)
3. **POST /api/check-rent** - Rent fairness check (accepts JSON)
4. **POST /api/generate-repair-request** - Repair letter generation (accepts JSON)
5. **POST /api/analyze-dispute** - Deposit dispute analysis (accepts multipart/form-data with image)

### Knowledge Base Structure

**7 Rule Categories:**
1. `access_and_privacy.json` - Landlord entry rights, privacy
2. `deposits.json` - Security deposit limits, return timelines
3. `missing_clauses.json` - Important protections that should be present
4. `other.json` - Miscellaneous regulations
5. `rent.json` - Rent increases, RPZ rules
6. `repairs.json` - Maintenance responsibilities
7. `termination.json` - Notice periods, eviction rules

**Rule Schema:**
```json
{
  "rule_id": "DEP001",
  "topic": "Security Deposit Amount",
  "category": "Deposits",
  "summary": "Brief summary",
  "explanation": "Detailed plain-language explanation",
  "legal_reference": "Residential Tenancies Act 2004",
  "legal_url": "https://www.rtb.ie/...",
  "keywords": ["deposit", "security deposit"],
  "alert_if_found": ["two months' rent"],
  "alert_if_missing": ["deposit return"],
  "severity": "High|Medium|Low",
  "recommended_action": "What the tenant should do"
}
```

### AI Configuration

**Model:** gemini-2.0-flash
- Fast, cost-effective model
- Supports multimodal input (text + images)
- 8192 max output tokens
- Temperature: 0.2 (more deterministic, less creative)

**Safety Settings:** All categories set to BLOCK_NONE to allow legal analysis

**Prompt Engineering Approach:**
- Structured prompts with clear instructions
- Request JSON-only responses (no markdown)
- Include legal context and examples in prompts
- Use plain-language guidelines for accessibility

---

## Key Implementation Details

### Lease Analysis Flow

1. **File Upload:**
   - Frontend: react-dropzone with PDF validation
   - Max size: 10MB
   - Drag-and-drop support

2. **Text Extraction:**
   - PyPDF2 extracts text from PDF
   - Handles scanned documents (warns if insufficient text)
   - Minimum 100 characters required for analysis

3. **Prompt Construction:**
   - Loads prompt template from `prompt_template.txt`
   - Injects knowledge base as JSON
   - Injects extracted lease text
   - Final prompt: template + rules + lease text

4. **AI Analysis:**
   - Gemini 2.0 Flash processes prompt
   - Returns structured JSON with:
     - key_terms (object)
     - alerts (array)
     - good_to_know (array)

5. **Missing Clause Detection:**
   - **Rule-based system** (not AI-dependent)
   - Checks for rules with `alert_if_missing` field
   - Searches lease text for keywords
   - If keywords absent, adds to `missing_clauses` array
   - Prevents duplicates via rule_id tracking

6. **Response Enhancement:**
   - Each alert includes severity (High/Medium/Low)
   - Each alert links to official RTB documentation
   - Plain-language explanations (no legal jargon)

### RPZ Detection Algorithm

**Multi-layer approach:**

1. **Eircode Routing Key Matching:**
   - Extracts 3-character routing key (e.g., D01, A96, W23)
   - Maps to county/area using EIRCODE_TO_AREA dictionary
   - Direct match = high confidence

2. **Dublin Area Name Matching:**
   - 90+ specific Dublin area names (Ranelagh, Clontarf, etc.)
   - Handles addresses that don't mention "Dublin" explicitly
   - Case-insensitive matching

3. **County-Level Matching:**
   - Checks if county name appears in address
   - For fully-designated counties (Dublin, Kildare, etc.) → immediate RPZ
   - For partially-designated counties (Cork, Kerry) → checks specific electoral areas

**Data Sources:**
- Based on Housing Agency RPZ designations (May 2025)
- Regularly updated to reflect legislative changes

### Frontend Design Philosophy

**Brand Identity:**
- **Primary Color:** Indigo (#6366F1) - trust, authority
- **Shield Icon:** Protection, advocacy
- **Typography:** Google Sans (headings), Roboto (body)

**UI Components:**
- **StarBorder:** Animated gradient border on CTA buttons
- **RotatingText:** Cycles through feature descriptions
- **Motion:** Framer Motion for smooth transitions

**User Experience:**
- Single-page application flow
- Tab-based feature navigation
- Real-time feedback during analysis
- Copy-to-clipboard for generated letters

---

## Challenges & Solutions

### Challenge 1: Scanned PDFs
**Problem:** PyPDF2 can't extract text from scanned images

**Solution:**
- Detect low text extraction (< 100 chars)
- Return helpful error message
- Suggest uploading text-based PDF or different document
- Still run missing clause detection (doesn't require full text)

### Challenge 2: AI Response Reliability
**Problem:** AI might return markdown-wrapped JSON or malformed responses

**Solution:**
- Strip markdown code blocks (```json...```)
- Validate response structure
- Provide fallback responses if parsing fails
- Log errors for debugging

### Challenge 3: Knowledge Base Maintenance
**Problem:** Irish tenancy law changes frequently

**Solution:**
- Modular JSON rule files (easy to update)
- Each rule includes legal_url for verification
- Validation on load (checks required fields)
- Logs summary of loaded rules by category

### Challenge 4: Multimodal Image Analysis
**Problem:** Sending images to AI requires proper encoding

**Solution:**
- Base64 encode image data
- Create multimodal prompt array: [text, {mime_type, data}]
- Handle both Parts response and text response from Gemini

---

## Demo & Testing Points

### Live Demo Script

**Lease Analyzer:**
1. Upload sample lease with excessive deposit (€2,400 for €1,200/month rent)
2. Show High severity alert for DEP001 violation
3. Highlight link to RTB official guidance
4. Point out "Missing Clauses" section

**Rent Checker:**
1. Enter Dublin address (e.g., "123 Ranelagh, Dublin")
2. Show RPZ detection working
3. Enter high rent (e.g., €2,500 for 2-bed)
4. Get market assessment (HIGH) with AI explanation

**Repair Request:**
1. Select "Heating/Boiler" issue
2. Describe problem: "No hot water for 3 days in winter"
3. Generate professional letter citing Housing Standards 2019
4. Show copy-to-clipboard functionality

**Deposit Dispute:**
1. Upload photo of minor scuff on wall
2. Enter landlord claim: "€200 for wall damage"
3. Get "normal wear-and-tear" classification
4. Review 3-5 dispute arguments for RTB

### Testing Considerations

**Edge Cases Handled:**
- Empty/corrupted PDFs
- Scanned documents
- Addresses not in database
- API key not configured (demo mode)
- Image analysis failures
- JSON parsing errors

**Error Handling:**
- User-friendly error messages (no technical jargon)
- Graceful degradation (partial analysis if possible)
- Detailed server-side logging for debugging

---

## Future Enhancements

### Short-term (Next Sprint)
1. **Real Rental Data Integration:**
   - Connect to Daft.ie or RTB APIs for actual comparable listings
   - Replace mock data in rent checker

2. **User Accounts:**
   - Save analysis history
   - Track multiple properties
   - Export reports as PDF

3. **Email Integration:**
   - Send repair requests directly from platform
   - CC tenant automatically

### Medium-term
1. **RTB Case Database:**
   - Reference previous RTB determinations
   - Show precedents for similar disputes

2. **Document Generation:**
   - Generate RTB dispute forms
   - Create Notice of Intention to Terminate templates
   - Produce evidence bundles for hearings

3. **Multi-language Support:**
   - Polish, Romanian, Spanish (common immigrant languages in Ireland)
   - Accessibility for non-native English speakers

### Long-term Vision
1. **AI Chat Assistant:**
   - Conversational interface for legal questions
   - Context-aware responses based on user's situation

2. **Landlord Platform:**
   - Compliance checker for landlords
   - Template generator for compliant leases

3. **Legal Network Integration:**
   - Directory of tenant advocacy groups
   - Referrals to pro-bono lawyers for complex cases

---

## Metrics & Impact

### Success Metrics
- **Number of lease analyses performed**
- **High-severity issues detected** (potential law violations prevented)
- **Rent fairness checks completed**
- **Repair requests generated**
- **User satisfaction score** (post-analysis survey)

### Target Impact
- **Democratize access** to legal information
- **Reduce unfair deposit deductions** by educating tenants
- **Prevent illegal lease terms** by empowering tenants to negotiate
- **Streamline RTB dispute process** with better evidence gathering

---

## Interview Questions & Answers

### Q: Why did you choose Gemini over other AI models?

**Answer:**
I chose Gemini 2.0 Flash for several reasons:

1. **Multimodal Capabilities:** Needed both text analysis (lease documents) and image analysis (deposit disputes). Gemini 2.0 Flash handles both natively.

2. **Cost-Effectiveness:** Flash model is faster and cheaper than Pro/Ultra while maintaining good quality for structured outputs.

3. **JSON Mode:** Reliable at returning structured JSON when prompted correctly, critical for integrating AI responses into the frontend.

4. **Context Window:** Large enough to handle full lease documents + knowledge base in a single prompt.

5. **Familiarity:** I had experience with Google's AI offerings and found the Python SDK well-documented.

### Q: How do you ensure the AI provides accurate legal information?

**Answer:**
Several safety mechanisms:

1. **Knowledge Base Ground Truth:** All rules are manually curated from official RTB sources. The AI interprets the lease against these verified rules, not generating legal knowledge from scratch.

2. **Structured Prompts:** Prompts include explicit legal context and examples, guiding the AI to specific conclusions rather than general legal advice.

3. **Missing Clause Detection:** Critical rules are checked via keyword matching (deterministic), not left purely to AI interpretation.

4. **Source Links:** Every alert includes a link to official RTB documentation so users can verify information independently.

5. **Disclaimer:** Clear messaging that this is informational, not legal advice, encouraging users to seek professional help for complex cases.

6. **Low Temperature (0.2):** Reduces creativity/hallucination, prioritizes accuracy and consistency.

### Q: How would you scale this to handle thousands of users?

**Answer:**

**Current Bottlenecks:**
- Flask is synchronous (blocking)
- Gemini API calls add latency (2-5 seconds)
- No caching mechanism

**Scaling Strategy:**

1. **Backend Optimization:**
   - Switch to async framework (FastAPI) for concurrent request handling
   - Add Redis caching for repeated analyses (hash PDF content)
   - Implement request queuing with Celery for background processing

2. **Infrastructure:**
   - Deploy backend on cloud run/AWS Lambda for auto-scaling
   - Use CDN for frontend static assets
   - Database for storing analyses (PostgreSQL)

3. **API Optimization:**
   - Batch similar requests to Gemini API
   - Implement rate limiting and quotas
   - Add monitoring (Prometheus + Grafana)

4. **Frontend:**
   - Add loading states with progress indicators
   - Implement optimistic UI updates
   - Lazy load components

### Q: What was the most challenging part of this project?

**Answer:**

**Missing Clause Detection Logic:**

Initially, I relied solely on the AI to detect missing clauses. However, I found:
- AI was inconsistent (sometimes missed important absences)
- Different prompt runs gave different results
- No guarantee that critical protections would be flagged

**Solution:**
- Built a hybrid system: AI for interpretation + rule-based detection for critical gaps
- Created `alert_if_missing` field in knowledge base with keyword arrays
- Deterministic keyword matching ensures important clauses are always checked
- De-duplication logic prevents the same rule_id from appearing twice

**Learning:**
- AI is powerful for interpretation but deterministic systems are better for critical checks
- Combining both approaches provides reliability + flexibility

### Q: How do you handle data privacy and security?

**Answer:**

**Current Approach:**
1. **No Data Persistence:** Uploaded files are processed in-memory and immediately discarded
2. **HTTPS Only:** All data transmission encrypted
3. **No User Tracking:** No cookies, analytics, or user accounts (currently)
4. **API Key Security:** Environment variables, never committed to repo

**GDPR Compliance:**
- No personal data stored
- No data shared with third parties (except Gemini API for processing)
- Clear privacy policy in footer

**Future Plans:**
- Add user accounts with encrypted storage
- Implement data retention policies (auto-delete after 30 days)
- Add 2FA for account security
- Regular security audits and penetration testing

### Q: Why Flask instead of Django?

**Answer:**

Flask was the right choice for this project because:

1. **Simplicity:** This is primarily an API service, not a full web application. Flask's minimalism meant less boilerplate.

2. **Flexibility:** Easy to structure the codebase exactly how I wanted (modular route files, custom config).

3. **Fast Prototyping:** Could build and iterate quickly without Django's conventions.

4. **Lightweight:** Smaller footprint, faster cold starts (important for cloud deployment).

**When I'd use Django:**
- If I needed a built-in admin panel
- If I required ORM and database migrations from day one
- For a more traditional full-stack application

For a stateless API like Hestia, Flask + external tools (SQLAlchemy if needed later) was the pragmatic choice.

### Q: How would you test this application?

**Answer:**

**Unit Tests:**
- Test PDF text extraction with sample files
- Test RPZ detection logic with known addresses
- Test rule loading and validation
- Mock Gemini API responses for deterministic testing

**Integration Tests:**
- Test full lease analysis flow end-to-end
- Test error handling (corrupt PDFs, API failures)
- Test all API endpoints with various inputs

**E2E Tests:**
- Use Playwright/Cypress to test full user flows
- Upload files, verify UI updates correctly
- Test copy-to-clipboard, file validation, etc.

**AI Testing:**
- Create test suite of sample leases with known issues
- Validate that each issue is detected
- Regression testing when updating prompts

**Performance Testing:**
- Load testing with Apache JMeter
- Measure response times under concurrent load
- Identify bottlenecks

**Current Status:**
Manual testing only. Would prioritize integration tests first, then unit tests, then E2E.

---

## Key Talking Points for Interviews

✅ **Impact-Focused:** Emphasize how this helps real people navigate complex legal systems

✅ **Technical Depth:** Can discuss AI prompt engineering, multimodal models, PDF processing, React hooks, TypeScript

✅ **Product Thinking:** Considered UX, error handling, accessibility, scalability

✅ **Real-World Constraints:** Acknowledged limitations (mock data, no user accounts yet) and planned roadmap

✅ **Legal/Ethical Awareness:** Disclaimers, accuracy mechanisms, GDPR compliance

✅ **Full-Stack Competency:** Designed and implemented both frontend and backend, plus AI integration

---

## Quick Stats

- **7** Curated rule categories covering Irish tenancy law
- **90+** Dublin area names for RPZ detection
- **4** Core features (Lease Analyzer, Rent Checker, Repair Assistant, Dispute Kit)
- **5** API endpoints
- **10MB** Maximum PDF upload size
- **2 seconds** Typical AI response time
- **8192** tokens max output from Gemini

---

## Repository Structure

```
Hestia-AI-Advocate-for-Tenants/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── config.py                 # Settings, API key management
│   │   ├── main.py                   # Core Flask app, lease analysis
│   │   ├── routes.py                 # Health check routes
│   │   ├── prompts.py                # Legacy prompts (deprecated)
│   │   ├── rent_checker.py           # RPZ detection, rent analysis
│   │   ├── repair_requests.py        # Repair letter generation
│   │   ├── deposit_disputes.py       # Image analysis for disputes
│   │   ├── prompt_template.txt       # Main AI prompt template
│   │   └── rules/                    # Knowledge base
│   │       ├── access_and_privacy.json
│   │       ├── deposits.json
│   │       ├── missing_clauses.json
│   │       ├── other.json
│   │       ├── rent.json
│   │       ├── repairs.json
│   │       └── termination.json
│   └── requirements.txt              # Python dependencies
├── src/
│   ├── app/
│   │   ├── page.tsx                  # Landing page
│   │   ├── layout.tsx                # Root layout
│   │   └── app/page.tsx              # Main application page
│   └── components/
│       ├── FileUpload.tsx            # PDF upload component
│       ├── RentChecker.tsx           # Rent checker UI
│       ├── RepairRequestAssistant.tsx# Repair request UI
│       ├── DepositDisputeKit.tsx     # Deposit dispute UI
│       ├── RotatingText.tsx          # Animated text component
│       └── StarBorder.tsx            # Animated border component
├── package.json                      # Node dependencies, scripts
└── README.md                         # Project documentation
```

---

## Closing Statement

Hestia represents a practical application of modern AI to solve real social issues. It's not just a tech demo—it's designed to genuinely help people who often can't afford legal representation. The project demonstrates:

1. **Full-stack development** (Next.js + Flask + AI)
2. **Product thinking** (identified user pain points, designed solutions)
3. **Attention to detail** (error handling, accessibility, legal accuracy)
4. **Scalability awareness** (acknowledged current limitations, planned roadmap)
5. **Social impact** (democratizing access to legal information)

I'm proud of the technical implementation, but more importantly, I'm excited about the potential to help Irish tenants stand up for their rights.

---

**Last Updated:** November 23, 2025
**Project Status:** Production-ready MVP, actively maintained
**Next Priority:** User testing with tenant advocacy groups
