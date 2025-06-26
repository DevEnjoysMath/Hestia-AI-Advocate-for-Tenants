import json
import base64
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

def analyze_deposit_dispute(image_data: bytes, description: str, deduction_amount: str) -> Dict[str, Any]:
    """
    Analyze an image of alleged damage for a deposit dispute.
    
    Args:
        image_data: The binary image data
        description: Description of the alleged damage
        deduction_amount: The amount being deducted from the deposit
        
    Returns:
        A dictionary with analysis and arguments for the dispute
    """
    # Encode the image as base64
    image_base64 = base64.b64encode(image_data).decode('utf-8')
    
    # Prepare prompt for Gemini
    prompt = f"""
    You are an AI tenancy advocate helping an Irish tenant dispute an unfair deposit deduction.

    ISSUE DESCRIPTION:
    The landlord is claiming €{deduction_amount} for the following alleged damage:
    {description}

    I will show you an image of this alleged damage. Please analyze it and provide arguments the tenant can use in their dispute with the Residential Tenancies Board (RTB).

    LEGAL CONTEXT:
    Under Irish tenancy law, landlords can only make deductions from deposits for:
    1. Damage beyond "normal wear and tear"
    2. Unpaid rent or bills
    3. Replacing missing items that were in the property inventory

    "Normal wear and tear" is defined as deterioration that occurs naturally over time with normal use, despite reasonable care and maintenance. Examples include faded paint, minor scuffs on walls, slight carpet wear in high-traffic areas, and small nail holes from picture hanging.

    YOUR TASK:
    1. Analyze the image to determine if this appears to be normal wear and tear or actual damage
    2. Provide a detailed assessment of what's shown in the image
    3. Generate 3-5 strong arguments the tenant can use in their dispute
    4. Estimate what would be a fair deduction amount (if any)

    Return your analysis as a JSON object with this structure:
    {{
        "analysis": "Detailed description and assessment of what's shown in the image",
        "arguments": ["Argument 1", "Argument 2", "Argument 3", ...],
        "wear_and_tear_classification": boolean (true if it appears to be normal wear and tear, false if it may constitute actual damage),
        "estimated_fair_deduction": "€X (or €0 if no deduction is warranted)"
    }}

    IMPORTANT: Your response MUST be valid JSON and nothing else. Do not include any explanations, markdown formatting, or text outside of the JSON object.
    """
    
    # Call Gemini API with multimodal input (text + image)
    model = genai.GenerativeModel(
        model_name='gemini-2.0-flash',
        generation_config=generation_config,
        safety_settings=safety_settings
    )
    
    # Create multimodal prompt with both text and image
    multimodal_prompt = [
        prompt,
        {
            "mime_type": "image/jpeg",
            "data": image_base64
        }
    ]
    
    response = model.generate_content(multimodal_prompt)
    
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
            "analysis": "Unable to analyze the image properly. The image quality may be insufficient or the damage may not be clearly visible.",
            "arguments": [
                "Request a more detailed explanation from the landlord about the specific damage being claimed",
                "Ask for evidence of the condition before and after your tenancy",
                "Request a breakdown of the repair costs"
            ],
            "wear_and_tear_classification": True,  # Default to tenant's favor
            "estimated_fair_deduction": "€0"
        } 