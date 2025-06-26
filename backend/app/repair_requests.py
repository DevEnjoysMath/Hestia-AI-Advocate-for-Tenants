import json
from typing import Dict, Any
import google.generativeai as genai
from .config import settings

# Configure the Gemini API
genai.configure(api_key=settings.GOOGLE_API_KEY)

# Configure generation settings for Gemini 2.0
generation_config = {
    "temperature": 0.2,  # Lower temperature for more predictable outputs
    "max_output_tokens": 8192,  # Increased for detailed analysis
}

safety_settings = [
    {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
    {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
]

# Issue type descriptions and legal references
ISSUE_TYPES = {
    "hot_water": {
        "description": "No hot water or issues with water heating system",
        "legal_reference": "Section 12(1)(b) of the Residential Tenancies Act 2004 requires landlords to maintain the property in a good state of repair."
    },
    "heating": {
        "description": "Heating system not working properly",
        "legal_reference": "Section 12(1)(b) of the Residential Tenancies Act 2004 requires landlords to maintain the property in a good state of repair."
    },
    "leak": {
        "description": "Water leak or pipe issues",
        "legal_reference": "Section 12(1)(b) of the Residential Tenancies Act 2004 requires landlords to maintain the property in a good state of repair."
    },
    "electrical": {
        "description": "Electrical problems or safety concerns",
        "legal_reference": "Section 12(1)(b) of the Residential Tenancies Act 2004 requires landlords to maintain the property in a good state of repair, and under the Housing (Standards for Rented Houses) Regulations 2019, all electrical installations must be safe."
    },
    "appliance": {
        "description": "Broken or malfunctioning appliance provided by the landlord",
        "legal_reference": "Section 12(1)(b) of the Residential Tenancies Act 2004 requires landlords to maintain appliances provided as part of the tenancy."
    },
    "mold": {
        "description": "Mold, dampness, or ventilation issues",
        "legal_reference": "Under the Housing (Standards for Rented Houses) Regulations 2019, all rental properties must be free from damp and mold, and have adequate ventilation."
    },
    "structural": {
        "description": "Structural issues with the property",
        "legal_reference": "Section 12(1)(b) of the Residential Tenancies Act 2004 requires landlords to maintain the structure and exterior of the dwelling."
    },
    "pest": {
        "description": "Pest infestation",
        "legal_reference": "Under the Housing (Standards for Rented Houses) Regulations 2019, rental properties must be maintained in a proper state of structural repair and be vermin-proof."
    },
    "other": {
        "description": "Other maintenance or repair issue",
        "legal_reference": "Section 12(1)(b) of the Residential Tenancies Act 2004 requires landlords to maintain the property in a good state of repair."
    }
}

def generate_repair_request(issue_type: str, details: str = "") -> Dict[str, Any]:
    """
    Generate a repair request email based on the issue type and additional details.
    
    Args:
        issue_type: The type of repair issue
        details: Additional details about the issue (optional)
        
    Returns:
        A dictionary with the subject and message for the repair request
    """
    # Get issue information
    issue_info = ISSUE_TYPES.get(issue_type, ISSUE_TYPES["other"])
    
    # Prepare prompt for Gemini
    prompt = f"""
    You are a professional communications assistant helping a tenant draft a formal repair request email to their landlord.
    
    ISSUE TYPE: {issue_info["description"]}
    
    ADDITIONAL DETAILS PROVIDED BY TENANT:
    {details if details else "No additional details provided."}
    
    LEGAL REFERENCE:
    {issue_info["legal_reference"]}
    
    TASK:
    Draft a clear, polite but firm email to a landlord requesting repair for this issue. The email should:
    1. Be professional and courteous in tone
    2. Clearly describe the issue and its impact
    3. Reference the landlord's legal responsibility
    4. Request timely action
    5. Offer cooperation in facilitating the repair
    
    Return your response as a JSON object with this structure:
    {{
        "subject": "A clear subject line for the email",
        "message": "The full body of the email, including greeting and sign-off"
    }}
    
    IMPORTANT: Your response MUST be valid JSON and nothing else. Do not include any explanations, markdown formatting, or text outside of the JSON object.
    """
    
    # Call Gemini API
    model = genai.GenerativeModel(
        model_name='gemini-2.0-flash',
        generation_config=generation_config,
        safety_settings=safety_settings
    )
    response = model.generate_content(prompt)
    
    try:
        # Parse the response as JSON
        # For Gemini 2.0, try to get the response parts
        if hasattr(response, 'parts') and response.parts:
            response_text = response.parts[0].text
        else:
            response_text = response.text
            
        # Try to clean up the response if it's not pure JSON
        response_text = response_text.strip()
        if response_text.startswith("```json"):
            response_text = response_text.split("```json")[1]
        if response_text.endswith("```"):
            response_text = response_text.rsplit("```", 1)[0]
        
        result = json.loads(response_text)
        return result
    except json.JSONDecodeError:
        # If the response is not valid JSON, return a generic message
        return {
            "subject": f"Request for Repair: {issue_info['description']}",
            "message": "Dear Landlord,\n\nI am writing to request a repair for an issue in my rented property. There appears to be a problem with the formatting of this message. Please contact me directly to discuss the details of the repair needed.\n\nThank you for your attention to this matter.\n\nSincerely,\n[Your Name]"
        } 