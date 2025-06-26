import os
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

# Updated list of Rent Pressure Zones in Ireland based on Housing Agency data (May 2025)
# Source: https://www.housingagency.ie/rent-pressure-zones
RPZ_AREAS = {
    # Full Local Authorities
    "dublin": ["dublin city", "south dublin", "fingal", "dún laoghaire-rathdown"],
    "kildare": ["kildare"],
    "louth": ["louth"],
    "meath": ["meath"],
    "wicklow": ["wicklow"],
    "galway": ["galway city", "galway county"],
    "kilkenny": ["kilkenny"],
    "limerick": ["limerick"],
    "waterford": ["waterford"],
    "westmeath": ["westmeath"],
    
    # Local Electoral Areas in Mayo
    "mayo": ["castlebar", "westport"],
    
    # Local Electoral Areas in Roscommon
    "roscommon": ["athlone"],
    
    # Local Electoral Areas in Sligo
    "sligo": ["sligo/strandhill", "sligo/drumcliffe"],
    
    # Local Electoral Areas in Carlow
    "carlow": ["carlow", "tullow"],
    
    # Local Electoral Areas in Laois
    "laois": ["graiguecullen/portarlington", "portlaoise"],
    
    # Local Electoral Areas in Offaly
    "offaly": ["tullamore"],
    
    # Local Electoral Areas in Wexford
    "wexford": ["gorey"],
    
    # Local Electoral Areas in Clare
    "clare": ["ennis", "shannon"],
    
    # Local Electoral Areas in Cork
    "cork": ["cork city", "ballincollig/carrigaline", "bandon/kinsale", "cobh", "fermoy", "macroom", "mallow", "midleton"],
    
    # Local Electoral Areas in Kerry
    "kerry": ["killarney"]
}

# Dublin areas that might not explicitly mention Dublin in the address
DUBLIN_AREAS = [
    "blackrock", "booterstown", "cabinteely", "dalkey", "deansgrange", "dundrum", "foxrock", 
    "killiney", "monkstown", "sandyford", "stillorgan", "dun laoghaire", "ballsbridge", 
    "ranelagh", "rathmines", "rathgar", "donnybrook", "sandymount", "clontarf", "drumcondra",
    "glasnevin", "phibsborough", "santry", "ballymun", "finglas", "castleknock", "blanchardstown",
    "clondalkin", "lucan", "tallaght", "rathfarnham", "terenure", "templeogue", "ballinteer",
    "leopardstown", "stepaside", "ballybrack", "sallynoggin", "glenageary", "shankill", "bray",
    "howth", "sutton", "baldoyle", "portmarnock", "malahide", "swords", "lusk", "rush", "skerries",
    "balbriggan", "donabate", "portrane", "chapelizod", "ballyfermot", "inchicore", "kilmainham",
    "crumlin", "walkinstown", "greenhills", "firhouse", "knocklyon", "ballyboden", "churchtown",
    "goatstown", "milltown", "clonskeagh", "dartry", "ballinteer", "ballyogan", "carrickmines",
    "cherrywood", "loughlinstown", "shankill", "deansgrange", "blackrock", "booterstown",
    "merrion", "ballsbridge", "irishtown", "ringsend", "east wall", "fairview", "marino",
    "artane", "killester", "raheny", "kilbarrack", "bayside", "donaghmede", "ayrfield",
    "coolock", "darndale", "priorswood", "kilmore", "beaumont", "whitehall", "cabra",
    "stoneybatter", "smithfield", "arbour hill", "broadstone", "phibsborough", "drumcondra"
]

# Mapping of Eircode routing keys to counties/areas
# Source: https://en.wikipedia.org/wiki/List_of_Eircode_routing_areas_in_Ireland
EIRCODE_TO_AREA = {
    # Dublin (all Dublin routing keys are in RPZs)
    "D01": "dublin", "D02": "dublin", "D03": "dublin", "D04": "dublin", 
    "D05": "dublin", "D06": "dublin", "D07": "dublin", "D08": "dublin",
    "D09": "dublin", "D10": "dublin", "D11": "dublin", "D12": "dublin",
    "D13": "dublin", "D14": "dublin", "D15": "dublin", "D16": "dublin",
    "D17": "dublin", "D18": "dublin", "D20": "dublin", "D22": "dublin",
    "D24": "dublin", "K32": "dublin", "K34": "dublin", "K36": "dublin",
    "K45": "dublin", "K67": "dublin", "K78": "dublin", "A41": "dublin",
    "A42": "dublin", "A45": "dublin", "A94": "dublin", "A96": "wicklow",
    
    # Counties that are fully RPZs
    "A41": "meath", "A42": "meath", "A45": "meath", "A46": "meath", 
    "A47": "meath", "A82": "meath", "A83": "meath", "A84": "meath", 
    "A85": "meath", "A86": "meath", "C15": "meath",
    "A91": "louth", "A92": "louth", "A81": "louth",
    "W12": "kildare", "W23": "kildare", "W34": "kildare", "W91": "kildare", 
    "R14": "kildare", "R51": "kildare", "R56": "kildare",
    "A63": "wicklow", "A67": "wicklow", "A98": "wicklow", "Y14": "wicklow", 
    "Y21": "wicklow", "Y25": "wicklow", "Y34": "wicklow", "A96": "wicklow",
    "H53": "galway", "H54": "galway", "H62": "galway", "H65": "galway", 
    "H71": "galway", "H91": "galway",
    "R95": "kilkenny",
    "V94": "limerick",
    "X91": "waterford", "X35": "waterford",
    "N37": "westmeath", "N91": "westmeath",
}

def is_in_rpz(address: str) -> bool:
    """
    Check if an address is in a Rent Pressure Zone.
    
    This checks against the official list from the Housing Agency.
    """
    address_lower = address.lower()
    address_upper = address.upper()
    
    # Direct check for Eircode routing keys
    # Look for patterns like A96 or D02 in the address
    for routing_key in EIRCODE_TO_AREA.keys():
        if routing_key in address_upper:
            area = EIRCODE_TO_AREA[routing_key]
            if area in ["dublin", "kildare", "louth", "meath", "wicklow", "galway", "kilkenny", "limerick", "waterford", "westmeath"]:
                return True
    
    # Check for Dublin areas that don't explicitly mention Dublin
    for area in DUBLIN_AREAS:
        if area in address_lower:
            return True
    
    # Check for full local authorities
    for county, areas in RPZ_AREAS.items():
        if county in address_lower:
            # For counties with full RPZ coverage, return True immediately
            if county in ["dublin", "kildare", "louth", "meath", "wicklow", "galway", "kilkenny", "limerick", "waterford", "westmeath"]:
                return True
            
            # For counties with partial RPZ coverage, check if any specific area is mentioned
            for area in areas:
                if area in address_lower:
                    return True
    
    return False

def get_mock_comparable_listings(address: str) -> list:
    """
    Generate mock comparable listings for an area.
    
    In a real application, this would fetch real data from
    a database or external API of rental listings.
    """
    # Extract area from address (simplified)
    area = ""
    for part in address.lower().split(','):
        part = part.strip()
        if "dublin" in part:
            area = part
            break
    
    # Default to Dublin 8 if no area found
    if not area:
        area = "dublin 8"
    
    # Generate mock listings based on area
    if "dublin" in area:
        # Dublin areas have higher rents
        return [
            {"address": f"123 Main St, {area}", "bedrooms": 2, "rent": 1950},
            {"address": f"456 High St, {area}", "bedrooms": 2, "rent": 2100},
            {"address": f"789 Park Ave, {area}", "bedrooms": 2, "rent": 2250},
            {"address": f"101 River View, {area}", "bedrooms": 2, "rent": 2000},
            {"address": f"202 Mountain Rd, {area}", "bedrooms": 2, "rent": 2150}
        ]
    else:
        # Other areas have lower rents
        return [
            {"address": f"123 Main St, {area}", "bedrooms": 2, "rent": 1200},
            {"address": f"456 High St, {area}", "bedrooms": 2, "rent": 1350},
            {"address": f"789 Park Ave, {area}", "bedrooms": 2, "rent": 1500},
            {"address": f"101 River View, {area}", "bedrooms": 2, "rent": 1250},
            {"address": f"202 Mountain Rd, {area}", "bedrooms": 2, "rent": 1400}
        ]

def get_rpz_rules() -> str:
    """Return the rules for Rent Pressure Zones."""
    return """
    Rent Pressure Zone (RPZ) Rules:
    1. Rent can only be increased by a maximum of 2% per year or general inflation (HICP), whichever is lower.
    2. Rent can only be reviewed once every 12 months.
    3. The landlord must provide 90 days' notice of any rent increase.
    4. The rent cannot exceed local market rents for similar properties.
    5. If a property is new to the rental market or has undergone substantial renovation, it may be exempt from RPZ rules.
    """

def analyze_rent_fairness(address: str, rent: float, property_type: str = "", bedrooms: int = 0) -> Dict[str, Any]:
    """
    Analyze if a rent price is fair and legal for a given address.
    
    Args:
        address: The property address
        rent: The monthly rent in euros
        property_type: The type of property (house or apartment)
        bedrooms: Number of bedrooms
        
    Returns:
        A dictionary with the analysis results
    """
    # Check if address is in RPZ
    in_rpz = is_in_rpz(address)
    
    # Get mock comparable listings
    comparables = get_mock_comparable_listings(address)
    
    # Prepare prompt for Gemini
    prompt = f"""
    You are a rental market expert in Ireland. Analyze the following rental property:
    
    Address: {address}
    Proposed Monthly Rent: €{rent}
    Property Type: {property_type if property_type else "Not specified"}
    Bedrooms: {bedrooms if bedrooms else "Not specified"}
    
    This property is {"in" if in_rpz else "not in"} a Rent Pressure Zone (RPZ).
    
    {"Here are the RPZ rules:" + get_rpz_rules() if in_rpz else ""}
    
    Here are comparable recent listings in the area:
    {json.dumps(comparables, indent=2)}
    
    Please provide:
    
    1. A legal assessment: Is this rent likely legal based on RPZ rules? If in an RPZ, consider if the rent seems to exceed the 2% annual increase cap or HICP inflation, whichever is lower. If not in an RPZ, it's generally legal unless it's discriminatory.
    
    2. A market assessment: Based on the comparable listings, is this rent HIGH, AVERAGE, or LOW for the area? Provide a confidence score (0-100%) and a brief explanation.
    
    Return your analysis as a JSON object with this structure:
    {{
        "legal_assessment": {{
            "is_legal": boolean,
            "explanation": string
        }},
        "rent_assessment": {{
            "assessment": "high" | "average" | "low",
            "confidence": number,
            "explanation": string
        }}
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
        
        analysis = json.loads(response_text)
        
        # Combine with RPZ status
        result = {
            "is_rpz": in_rpz,
            "legal_assessment": analysis["legal_assessment"],
            "rent_assessment": analysis["rent_assessment"]
        }
        
        return result
    except json.JSONDecodeError:
        # If the response is not valid JSON, return an error
        return {
            "is_rpz": in_rpz,
            "legal_assessment": {
                "is_legal": None,
                "explanation": "Error analyzing rent legality."
            },
            "rent_assessment": {
                "assessment": "unknown",
                "confidence": 0,
                "explanation": "Error analyzing rent fairness."
            }
        } 