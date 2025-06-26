import os
from flask import request, jsonify
import google.generativeai as genai
from PyPDF2 import PdfReader
import json
import io
from werkzeug.utils import secure_filename
import logging
import glob
import re
import traceback

from . import app
from .config import settings
from .prompts import get_analysis_prompt
from .rent_checker import analyze_rent_fairness
from .repair_requests import generate_repair_request
from .deposit_disputes import analyze_deposit_dispute

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Configuration
MAX_UPLOAD_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_EXTENSIONS = {'pdf'}
ALLOWED_IMAGE_EXTENSIONS = {'jpg', 'jpeg', 'png'}

# Configure Google AI
if settings.GOOGLE_API_KEY and settings.GOOGLE_API_KEY != "your_api_key_here":
    # Remove any URL encoding from the API key if present
    api_key = settings.GOOGLE_API_KEY
    if api_key.endswith('%'):
        api_key = api_key.rstrip('%')
        logger.debug("Removed trailing '%' from API key")
    
    logger.debug(f"Configuring Google AI with API key (first 4 chars): {api_key[:4]}...")
    genai.configure(api_key=api_key)
    
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
    
    try:
        model = genai.GenerativeModel(
            model_name='gemini-2.0-flash',
            generation_config=generation_config,
            safety_settings=safety_settings
        )
        logger.debug("Successfully created Gemini model")
    except Exception as e:
        logger.error(f"Error creating Gemini model: {str(e)}")
        model = None
else:
    logger.warning("Google API key not configured or is set to default value")
    model = None

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def allowed_image_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_IMAGE_EXTENSIONS

def extract_text_from_pdf(file_content):
    """Extract text from a PDF file using PyPDF2."""
    try:
        # Use BytesIO to create a file-like object from bytes
        pdf_file = io.BytesIO(file_content)
        pdf = PdfReader(pdf_file)
        text = ""
        for page in pdf.pages:
            text += page.extract_text() + "\n"
        return text
    except Exception as e:
        logger.error(f"Error processing PDF with PyPDF2: {str(e)}")
        raise Exception(f"Error processing PDF: {str(e)}")

def load_knowledge_base() -> list:
    """
    Loads all JSON rule files from the /rules directory.
    
    Returns:
        list: A list of all rules from all JSON files in the rules directory.
        
    Raises:
        FileNotFoundError: If no rules directory is found.
        json.JSONDecodeError: If any rule file contains invalid JSON.
    """
    rules = []
    
    # Try multiple possible paths to find the rules directory
    possible_dirs = [
        os.path.join(os.path.dirname(__file__), "rules"),  # If running from app directory
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "rules"),  # If running from backend directory
        "app/rules",  # Relative to backend directory
        "backend/app/rules"  # Relative to project root
    ]
    
    rule_files = []
    rules_dir = None
    
    # Find the rules directory
    for dir_path in possible_dirs:
        logger.debug(f"Looking for rules in: {dir_path}")
        if os.path.exists(dir_path) and os.path.isdir(dir_path):
            logger.info(f"Found rules directory at: {dir_path}")
            rules_dir = dir_path
            rule_files = glob.glob(os.path.join(dir_path, "*.json"))
            if rule_files:
                logger.info(f"Found {len(rule_files)} rule files in {dir_path}")
                break
    
    if not rule_files:
        error_msg = f"No rule files found in any of these directories: {possible_dirs}"
        logger.error(error_msg)
        raise FileNotFoundError(error_msg)
    
    # Load and validate each rule file
    for file_path in rule_files:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                file_rules = json.load(f)
                
                # Validate that file_rules is a list
                if not isinstance(file_rules, list):
                    logger.error(f"Rule file {file_path} does not contain a list of rules")
                    continue
                
                # Validate each rule has required fields
                valid_rules = []
                for i, rule in enumerate(file_rules):
                    if not isinstance(rule, dict):
                        logger.warning(f"Rule {i} in {file_path} is not a dictionary, skipping")
                        continue
                    
                    required_fields = ['rule_id', 'topic', 'category', 'summary', 'explanation']
                    missing_fields = [field for field in required_fields if field not in rule]
                    
                    if missing_fields:
                        logger.warning(f"Rule {rule.get('rule_id', i)} in {file_path} missing required fields: {missing_fields}")
                        continue
                    
                    # Add legal_url field if it doesn't exist (for backward compatibility)
                    if 'legal_url' not in rule:
                        rule['legal_url'] = ""
                    
                    valid_rules.append(rule)
                
                logger.debug(f"Loaded {len(valid_rules)} valid rules from {os.path.basename(file_path)}")
                rules.extend(valid_rules)
                
        except json.JSONDecodeError as e:
            logger.error(f"Invalid JSON in rule file {file_path}: {e}")
            raise
        except Exception as e:
            logger.error(f"Error loading rule file {file_path}: {e}")
            raise
    
    # Log summary by category
    categories = {}
    for rule in rules:
        category = rule.get('category', 'Unknown')
        categories[category] = categories.get(category, 0) + 1
    
    for category, count in categories.items():
        logger.info(f"Loaded {count} rules for category: {category}")
    
    logger.info(f"Total rules loaded: {len(rules)}")
    return rules

def build_analysis_prompt(lease_text):
    """Builds the final prompt from the template and knowledge base."""
    try:
        # Try multiple possible paths to find the template file
        possible_paths = [
            os.path.join(os.path.dirname(__file__), "prompt_template.txt"),  # If running from app directory
            os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "prompt_template.txt"),  # If running from backend directory
            "app/prompt_template.txt",  # Relative to backend directory
            "backend/app/prompt_template.txt"  # Relative to project root
        ]
        
        template = None
        for path in possible_paths:
            try:
                logger.debug(f"Trying to open template at: {path}")
                with open(path, 'r') as f:
                    template = f.read()
                    logger.info(f"Successfully loaded prompt template from {path}")
                    break
            except FileNotFoundError:
                continue
        
        if template is None:
            logger.error(f"Prompt template not found in any of these locations: {possible_paths}")
            return None
    except Exception as e:
        logger.error(f"Error loading prompt template: {str(e)}")
        return None
        
    knowledge_base = load_knowledge_base()
    knowledge_base_json = json.dumps(knowledge_base, indent=2)
    
    return template.replace("{{knowledge_base}}", knowledge_base_json).replace("{{lease_text}}", lease_text)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "ai_configured": model is not None
    })

@app.route('/', methods=['GET'])
def root():
    """Root endpoint."""
    return jsonify({
        "message": "Hestia API is running",
        "endpoints": {
            "health": "/health",
            "analyze": "/api/analyze",
            "check-rent": "/api/check-rent",
            "generate-repair-request": "/api/generate-repair-request",
            "analyze-dispute": "/api/analyze-dispute"
        }
    })

@app.route('/api/analyze', methods=['POST'])
def analyze_lease():
    """Analyze a lease document using Google's Gemini AI."""
    # Check if AI model is available
    if not model:
        logger.error("Google AI model not configured properly")
        return jsonify({
            "error": "Our AI service is currently unavailable. Please try again later or contact support."
        }), 500
    
    # Check if file was uploaded
    if 'file' not in request.files:
        logger.warning("No file provided in request")
        return jsonify({"error": "Please select a PDF file to upload"}), 400
    
    file = request.files['file']
    
    # Check if file was selected
    if file.filename == '':
        logger.warning("Empty filename provided")
        return jsonify({"error": "Please select a PDF file to upload"}), 400
    
    # Check file extension
    if not allowed_file(file.filename):
        logger.warning(f"Invalid file type: {file.filename}")
        return jsonify({"error": "Only PDF files are supported. Please upload a PDF document."}), 400
    
    try:
        # Read file content
        file_content = file.read()
        
        # Check file size
        if len(file_content) > MAX_UPLOAD_SIZE:
            logger.warning(f"File too large: {len(file_content)} bytes")
            return jsonify({"error": "The file is too large. Please upload a smaller PDF (max 10MB)."}), 400
        
        # Extract text from PDF
        try:
            lease_text = extract_text_from_pdf(file_content)
            
            # Check if the text indicates it's a scanned document
            if lease_text.startswith("WARNING: This appears to be a scanned document"):
                logger.warning("Scanned document detected")
                return jsonify({
                    "key_terms": {"note": "This appears to be a scanned document"},
                    "alerts": [],
                    "good_to_know": [{
                        "title": "Scanned Document Detected",
                        "explanation": "Your PDF appears to be a scanned document, which means we can't extract the text to analyze it. For best results, please upload a PDF with actual text content (not images of text)."
                    }]
                })
            
            if not lease_text or len(lease_text.strip()) < 100:
                logger.warning("PDF contains insufficient text")
                return jsonify({
                    "key_terms": {"note": "Insufficient text found in your PDF"},
                    "alerts": [],
                    "good_to_know": [{
                        "title": "PDF Text Extraction Issue",
                        "explanation": "We couldn't extract enough text from your PDF to perform a proper analysis. This is usually because the PDF contains scanned images rather than actual text. Try uploading a PDF with selectable text or a different document."
                    }]
                })
            
            logger.info(f"Successfully extracted {len(lease_text)} characters from PDF")
        except Exception as pdf_err:
            logger.error(f"PDF extraction error: {str(pdf_err)}")
            return jsonify({
                "key_terms": {"error": "PDF extraction failed"},
                "alerts": [],
                "good_to_know": [{
                    "title": "PDF Reading Error",
                    "explanation": f"There was a problem reading your PDF: {str(pdf_err)}. Please ensure it's a valid PDF file with readable text."
                }]
            })
        
        # Generate prompt and get analysis from Gemini
        prompt = build_analysis_prompt(lease_text)
        if not prompt:
            return jsonify({"error": "Failed to build analysis prompt. Check server logs."}), 500
        
        # Check if we're using the default API key
        if settings.GOOGLE_API_KEY == "your_api_key_here":
            logger.error("Using default API key. Please set a valid GOOGLE_API_KEY in your environment.")
            return jsonify({
                "key_terms": {
                    "rent": "€1,200 per month (example)",
                    "deposit": "€1,200 (example)",
                    "lease_term": "12 months (example)",
                    "start_date": "1st July 2024 (example)"
                },
                "alerts": [{
                    "rule_id": "DEP001",
                    "title": "Demo Mode - API Key Not Configured",
                    "explanation": "This is a demonstration response. To get real analysis, please configure a valid Google API key.",
                    "severity": "High",
                    "recommendation": "Contact the administrator to set up the API key for real analysis."
                }],
                "good_to_know": [{
                    "title": "Demo Mode Active",
                    "explanation": "The system is running in demo mode. Text was successfully extracted from your PDF, but no real analysis was performed."
                }]
            })
        
        try:
            logger.info("Sending request to Gemini API")
            response = model.generate_content(prompt)
            logger.info("Received response from Gemini")
        except Exception as ai_err:
            logger.error(f"Gemini API error: {str(ai_err)}")
            return jsonify({
                "key_terms": {"error": "AI analysis failed"},
                "alerts": [],
                "good_to_know": [{
                    "title": "Analysis Error",
                    "explanation": "Our AI service encountered an error analyzing your lease. Please try again later."
                }]
            })
        
        # Debug the response
        logger.debug(f"Response from Gemini: {response.text[:200]}...")
        
        # Handle potential JSON parsing issues
        try:
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
            
            logger.debug(f"Cleaned response text: {response_text[:200]}...")
            
            # Parse the response
            try:
                analysis = json.loads(response_text)
                
                # Validate the response structure
                if not all(key in analysis for key in ['key_terms', 'alerts', 'good_to_know']):
                    logger.error("Missing required keys in analysis response")
                    return jsonify({
                        "error": "The analysis was incomplete. Please try again.",
                        "partial_result": analysis
                    }), 500
                
                # Check for missing clauses
                analysis = check_for_missing_clauses(analysis, lease_text, load_knowledge_base())
                
                return jsonify(analysis)
            except json.JSONDecodeError as json_err:
                logger.error(f"JSON parsing error: {str(json_err)}")
                # Try to provide a more helpful fallback response
                fallback = {
                    "key_terms": {},
                    "alerts": [],
                    "good_to_know": [{
                        "title": "Analysis Failed",
                        "explanation": "We were unable to fully analyze your lease. Please try again or contact support if the issue persists."
                    }]
                }
                
                return jsonify({
                    "error": "We had trouble processing the analysis results.",
                    "fallback_analysis": fallback,
                    "raw_response": response_text[:500]  # Truncate long responses
                }), 500
        except Exception as parse_err:
            logger.error(f"Response parsing error: {str(parse_err)}")
            return jsonify({
                "error": "We encountered an error processing the analysis results. Please try again.",
                "error_details": str(parse_err)
            }), 500
    
    except Exception as e:
        logger.error(f"Unexpected error in lease analysis: {str(e)}")
        return jsonify({"error": "An unexpected error occurred. Please try again or contact support."}), 500

def check_for_missing_clauses(result: dict, lease_text: str, knowledge_base: list) -> dict:
    """
    Check for important clauses that should be in a lease but are missing.
    
    Args:
        result (dict): The current analysis result.
        lease_text (str): The text of the lease agreement.
        knowledge_base (list): List of rules to use for analysis.
        
    Returns:
        dict: The updated analysis result with missing clauses.
    """
    # Initialize missing_clauses if it doesn't exist
    if "missing_clauses" not in result:
        result["missing_clauses"] = []
    
    # Get rules that have alert_if_missing field
    missing_clause_rules = [rule for rule in knowledge_base if "alert_if_missing" in rule]
    
    # Check each rule for missing clauses
    for rule in missing_clause_rules:
        # Check if any of the keywords are present in the lease text
        keywords_present = any(keyword.lower() in lease_text.lower() for keyword in rule.get("alert_if_missing", []))
        
        # If none of the keywords are present, this clause is missing
        if not keywords_present:
            # Create a missing clause alert
            missing_clause = {
                "rule_id": rule.get("rule_id", ""),
                "title": f"Missing: {rule.get('topic', '')}",
                "explanation": rule.get("explanation", ""),
                "severity": rule.get("severity", "Medium"),
                "recommendation": rule.get("recommended_action", ""),
                "legal_url": rule.get("legal_url", "")
            }
            
            result["missing_clauses"].append(missing_clause)
    
    return result

@app.route('/api/check-rent', methods=['POST'])
def check_rent():
    """Check if a rent price is fair and legal for a given address."""
    # Check if AI model is available
    if not model:
        return jsonify({
            "error": "Google AI API key not configured. Please set GOOGLE_API_KEY in your environment."
        }), 500
    
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Validate required fields
        if 'address' not in data or 'rent' not in data:
            return jsonify({"error": "Address and rent are required"}), 400
        
        address = data['address']
        rent = float(data['rent'])
        
        # Analyze rent fairness
        result = analyze_rent_fairness(address, rent)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": f"Error checking rent: {str(e)}"}), 500

@app.route('/api/generate-repair-request', methods=['POST'])
def repair_request():
    """Generate a repair request email based on the issue type and details."""
    # Check if AI model is available
    if not model:
        return jsonify({
            "error": "Google AI API key not configured. Please set GOOGLE_API_KEY in your environment."
        }), 500
    
    try:
        # Get JSON data from request
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        # Validate required fields
        if 'issue_type' not in data:
            return jsonify({"error": "Issue type is required"}), 400
        
        issue_type = data['issue_type']
        details = data.get('details', '')
        
        # Generate repair request
        result = generate_repair_request(issue_type, details)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": f"Error generating repair request: {str(e)}"}), 500

@app.route('/api/analyze-dispute', methods=['POST'])
def analyze_dispute():
    """Analyze a deposit dispute with image analysis."""
    # Check if AI model is available
    if not model:
        return jsonify({
            "error": "Google AI API key not configured. Please set GOOGLE_API_KEY in your environment."
        }), 500
    
    # Check if file was uploaded
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
    
    file = request.files['image']
    
    # Check if file was selected
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    # Check file extension
    if not allowed_image_file(file.filename):
        return jsonify({"error": "Only JPG and PNG images are allowed"}), 400
    
    try:
        # Read file content
        image_data = file.read()
        
        # Check file size
        if len(image_data) > MAX_UPLOAD_SIZE:
            return jsonify({"error": "File size too large"}), 400
        
        # Get form data
        description = request.form.get('description', '')
        deduction_amount = request.form.get('deduction_amount', '0')
        
        # Analyze deposit dispute
        result = analyze_deposit_dispute(image_data, description, deduction_amount)
        
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": f"Error analyzing dispute: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8001)
