"""
Input validation utilities for Hestia backend.
"""
import re
from typing import Optional, Tuple

# Irish Eircode pattern (e.g., D02 AF30, A96 C8W7)
EIRCODE_PATTERN = re.compile(r'^[A-Z]\d{2}\s?[A-Z0-9]{4}$', re.IGNORECASE)

# Email pattern (basic validation)
EMAIL_PATTERN = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')


def validate_address(address: str) -> Tuple[bool, Optional[str]]:
    """
    Validate an Irish address.

    Args:
        address: The address string to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not address or not isinstance(address, str):
        return False, "Address is required"

    address = address.strip()

    if len(address) < 5:
        return False, "Address is too short"

    if len(address) > 500:
        return False, "Address is too long"

    return True, None


def validate_rent(rent: float) -> Tuple[bool, Optional[str]]:
    """
    Validate a rent amount.

    Args:
        rent: The monthly rent amount in euros

    Returns:
        Tuple of (is_valid, error_message)
    """
    try:
        rent = float(rent)
    except (ValueError, TypeError):
        return False, "Rent must be a number"

    if rent <= 0:
        return False, "Rent must be greater than zero"

    if rent > 100000:
        return False, "Rent amount seems unrealistic (max €100,000)"

    return True, None


def validate_eircode(eircode: str) -> Tuple[bool, Optional[str]]:
    """
    Validate an Irish Eircode.

    Args:
        eircode: The Eircode to validate

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not eircode or not isinstance(eircode, str):
        return False, "Eircode is required"

    eircode = eircode.strip()

    if not EIRCODE_PATTERN.match(eircode):
        return False, "Invalid Eircode format (should be like D02 AF30)"

    return True, None


def validate_issue_type(issue_type: str) -> Tuple[bool, Optional[str]]:
    """
    Validate a repair request issue type.

    Args:
        issue_type: The type of repair issue

    Returns:
        Tuple of (is_valid, error_message)
    """
    VALID_ISSUE_TYPES = {
        'hot_water', 'heating', 'leak', 'electrical',
        'appliance', 'mold', 'structural', 'pest', 'other'
    }

    if not issue_type or not isinstance(issue_type, str):
        return False, "Issue type is required"

    issue_type = issue_type.strip().lower()

    if issue_type not in VALID_ISSUE_TYPES:
        return False, f"Invalid issue type. Must be one of: {', '.join(VALID_ISSUE_TYPES)}"

    return True, None


def validate_details(details: str, max_length: int = 5000) -> Tuple[bool, Optional[str]]:
    """
    Validate text details (for repair requests, etc.)

    Args:
        details: The details text
        max_length: Maximum allowed length

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not isinstance(details, str):
        return False, "Details must be text"

    if len(details) > max_length:
        return False, f"Details too long (max {max_length} characters)"

    return True, None


def validate_deduction_amount(amount: str) -> Tuple[bool, Optional[str]]:
    """
    Validate a deposit deduction amount.

    Args:
        amount: The deduction amount (can be string like "€200" or "200")

    Returns:
        Tuple of (is_valid, error_message)
    """
    if not amount or not isinstance(amount, str):
        return False, "Deduction amount is required"

    # Remove currency symbols and whitespace
    amount_cleaned = amount.replace('€', '').replace('$', '').replace(',', '').strip()

    try:
        amount_value = float(amount_cleaned)
    except ValueError:
        return False, "Invalid deduction amount format"

    if amount_value < 0:
        return False, "Deduction amount cannot be negative"

    if amount_value > 50000:
        return False, "Deduction amount seems unrealistic (max €50,000)"

    return True, None


def sanitize_string(text: str, max_length: int = 1000) -> str:
    """
    Sanitize a string for safe use.

    Args:
        text: The text to sanitize
        max_length: Maximum allowed length

    Returns:
        Sanitized string
    """
    if not text:
        return ""

    # Remove null bytes
    text = text.replace('\x00', '')

    # Trim to max length
    text = text[:max_length]

    # Strip whitespace
    text = text.strip()

    return text
