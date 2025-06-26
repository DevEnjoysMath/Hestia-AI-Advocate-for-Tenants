# Hestia-AI-Advocate-for-Tenants
Hestia is an AI-powered legal advocate for Irish tenants. Instantly analyze your lease agreement, uncover hidden risks, and get clear, actionable legal guidance - no jargon, just answers.

# Hestia - AI-Powered Tenant Advocacy Platform

Hestia is an AI-powered web application designed to help Irish renters navigate their tenancy rights and disputes.

## Features

1. **Lease Analyzer**: Analyzes lease agreements for legal issues, extracts key terms, and flags potential problems.
2. **Fair Rent Checker**: Determines if a rent price is fair and legal by checking if an address is in a Rent Pressure Zone (RPZ) and comparing to market rates.
3. **Repair Request Assistant**: Generates professional emails to landlords requesting repairs, citing relevant Irish tenancy laws.
4. **Deposit Dispute Kit**: Uses image analysis to help tenants dispute unfair deposit deductions by analyzing photos of alleged damage.

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- Google API key with access to Gemini AI

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   ```

3. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

4. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

5. Create a `.env` file in the backend directory with your Google API key:
   ```
   GOOGLE_API_KEY=your_google_api_key_here
   ```

### Frontend Setup

1. Install dependencies:
   ```
   npm install
   ```

### Running the Application

You can run both the frontend and backend servers with a single command:

```
npm run start-all
```

Or run them separately:

- Frontend: `npm run dev` (runs on port 3002)
- Backend: `npm run backend` (runs on port 8001)

## Technologies Used

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Flask, Google's Gemini AI
- **AI Models**: gemini-2.0-flash for text and image analysis

## Notes

- The application is configured to use port 3002 for the frontend and port 8001 for the backend.
- You must have a valid Google API key with access to the Gemini AI models.
- For the Deposit Dispute Kit, the application uses Gemini's image analysis capabilities to assess photos of alleged damage.
