# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Docker Support**: Complete Docker and Docker Compose configuration for easy deployment
  - Multi-stage Docker build for optimized image size
  - Docker Compose with Redis support for future caching
  - Comprehensive `.dockerignore` file
  - Health checks for container monitoring

- **Enhanced Backend**:
  - Rate limiting middleware (5 uploads/min, 20 requests/min)
  - Comprehensive input validation system
  - Request logging middleware
  - Error handling decorators
  - Validator utilities for addresses, rent amounts, Eircodes, etc.

- **Enhanced Frontend**:
  - Toast notification system for user feedback
  - PDF/Text export functionality for analysis reports
  - Copy-to-clipboard feature for quick sharing
  - Improved loading states and animations
  - Better error handling and display

- **Documentation**:
  - Complete API documentation (`API.md`)
  - Deployment guide with Docker, traditional, and cloud options (`DEPLOYMENT.md`)
  - Contributing guidelines (`CONTRIBUTING.md`)
  - Comprehensive interview notes (`INTERVIEW_NOTES.md`)
  - This changelog (`CHANGELOG.md`)

- **Developer Experience**:
  - Improved TypeScript types throughout frontend
  - Better code organization and modularity
  - Comprehensive error messages
  - Development best practices documentation

### Enhanced
- **UI/UX Improvements**:
  - More intuitive toast notifications replacing console logs
  - Smoother animations and transitions
  - Better mobile responsiveness
  - Improved accessibility features
  - Enhanced visual feedback for user actions

- **Security**:
  - Input validation on all endpoints
  - File size and type restrictions
  - Rate limiting to prevent abuse
  - Sanitization of user inputs

- **Performance**:
  - Optimized Docker builds with multi-stage approach
  - Better error handling reducing unnecessary retries
  - Structured logging for performance monitoring

### Changed
- Main app page now includes toast notifications
- Export functionality moved to dedicated utility module
- Backend structured with middleware pattern
- Documentation structure reorganized for clarity

### Fixed
- Improved error messages for scanned PDFs
- Better handling of edge cases in lease analysis
- More robust file upload validation

## [1.0.0] - 2025-01-06

### Added
- Initial release with four core features:
  - Lease Analyzer: AI-powered lease agreement analysis
  - Fair Rent Checker: RPZ detection and market analysis
  - Repair Request Assistant: Professional email generation
  - Deposit Dispute Kit: Image analysis for damage assessment

- Knowledge Base:
  - 7 categories of Irish tenancy law rules
  - Official RTB references
  - Severity ratings and recommendations

- Frontend:
  - Next.js with TypeScript
  - Tailwind CSS for styling
  - Framer Motion for animations
  - Tab-based feature navigation

- Backend:
  - Flask REST API
  - Google Gemini 2.0 Flash AI integration
  - PDF text extraction with PyPDF2
  - Multimodal image analysis

[Unreleased]: https://github.com/yourusername/Hestia-AI-Advocate-for-Tenants/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/Hestia-AI-Advocate-for-Tenants/releases/tag/v1.0.0
