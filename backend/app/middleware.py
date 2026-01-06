"""
Middleware for request validation, rate limiting, and error handling.
"""
import time
import functools
import logging
from collections import defaultdict
from datetime import datetime, timedelta
from flask import request, jsonify
from typing import Callable, Dict, Any

logger = logging.getLogger(__name__)

# Simple in-memory rate limiter (use Redis for production)
class RateLimiter:
    def __init__(self, max_requests: int = 10, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: Dict[str, list] = defaultdict(list)

    def is_allowed(self, identifier: str) -> bool:
        """Check if a request from this identifier is allowed."""
        now = datetime.now()
        window_start = now - timedelta(seconds=self.window_seconds)

        # Clean old requests
        self.requests[identifier] = [
            req_time for req_time in self.requests[identifier]
            if req_time > window_start
        ]

        # Check if under limit
        if len(self.requests[identifier]) >= self.max_requests:
            return False

        # Add current request
        self.requests[identifier].append(now)
        return True

    def get_retry_after(self, identifier: str) -> int:
        """Get seconds until the rate limit resets."""
        if not self.requests[identifier]:
            return 0
        oldest_request = min(self.requests[identifier])
        reset_time = oldest_request + timedelta(seconds=self.window_seconds)
        seconds_until_reset = (reset_time - datetime.now()).total_seconds()
        return max(0, int(seconds_until_reset))


# Global rate limiters for different endpoints
UPLOAD_RATE_LIMITER = RateLimiter(max_requests=5, window_seconds=60)  # 5 uploads per minute
ANALYSIS_RATE_LIMITER = RateLimiter(max_requests=20, window_seconds=60)  # 20 requests per minute


def rate_limit(limiter: RateLimiter):
    """Decorator for rate limiting endpoints."""
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            # Use IP address as identifier (could also use API key, user ID, etc.)
            identifier = request.remote_addr or 'unknown'

            if not limiter.is_allowed(identifier):
                retry_after = limiter.get_retry_after(identifier)
                logger.warning(f"Rate limit exceeded for {identifier}")
                return jsonify({
                    "error": "Too many requests. Please try again later.",
                    "retry_after": retry_after
                }), 429

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def validate_file_upload(max_size_mb: int = 10, allowed_extensions: set = None):
    """Decorator for validating file uploads."""
    if allowed_extensions is None:
        allowed_extensions = {'pdf'}

    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if file exists in request
            if 'file' not in request.files:
                return jsonify({"error": "No file provided"}), 400

            file = request.files['file']

            # Check if filename is empty
            if file.filename == '':
                return jsonify({"error": "No file selected"}), 400

            # Check file extension
            if '.' not in file.filename:
                return jsonify({"error": "Invalid file format"}), 400

            ext = file.filename.rsplit('.', 1)[1].lower()
            if ext not in allowed_extensions:
                return jsonify({
                    "error": f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
                }), 400

            # Check file size (read into memory to check)
            file.seek(0, 2)  # Seek to end
            size = file.tell()
            file.seek(0)  # Reset to beginning

            max_size_bytes = max_size_mb * 1024 * 1024
            if size > max_size_bytes:
                return jsonify({
                    "error": f"File too large. Maximum size: {max_size_mb}MB"
                }), 400

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def validate_json_request(required_fields: list = None):
    """Decorator for validating JSON request bodies."""
    if required_fields is None:
        required_fields = []

    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            # Check if request has JSON data
            if not request.is_json and not request.get_json(silent=True):
                return jsonify({"error": "Request must be JSON"}), 400

            data = request.get_json()

            # Check required fields
            missing_fields = [field for field in required_fields if field not in data]
            if missing_fields:
                return jsonify({
                    "error": f"Missing required fields: {', '.join(missing_fields)}"
                }), 400

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def log_request():
    """Decorator for logging requests."""
    def decorator(f: Callable) -> Callable:
        @functools.wraps(f)
        def decorated_function(*args, **kwargs):
            start_time = time.time()
            logger.info(f"Request started: {request.method} {request.path}")

            try:
                result = f(*args, **kwargs)
                duration = time.time() - start_time
                logger.info(f"Request completed: {request.method} {request.path} ({duration:.2f}s)")
                return result
            except Exception as e:
                duration = time.time() - start_time
                logger.error(f"Request failed: {request.method} {request.path} ({duration:.2f}s) - {str(e)}")
                raise
        return decorated_function
    return decorator


def handle_errors(f: Callable) -> Callable:
    """Decorator for comprehensive error handling."""
    @functools.wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except ValueError as e:
            logger.error(f"Validation error: {str(e)}")
            return jsonify({"error": f"Invalid input: {str(e)}"}), 400
        except FileNotFoundError as e:
            logger.error(f"File not found: {str(e)}")
            return jsonify({"error": "Required resource not found"}), 500
        except ConnectionError as e:
            logger.error(f"Connection error: {str(e)}")
            return jsonify({"error": "Service temporarily unavailable"}), 503
        except Exception as e:
            logger.error(f"Unexpected error: {str(e)}", exc_info=True)
            return jsonify({"error": "An unexpected error occurred"}), 500
    return decorated_function
