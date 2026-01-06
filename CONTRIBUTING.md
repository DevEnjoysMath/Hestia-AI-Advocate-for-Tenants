# Contributing to Hestia

Thank you for your interest in contributing to Hestia! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Coding Guidelines](#coding-guidelines)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of:
- Experience level
- Gender identity and expression
- Sexual orientation
- Disability
- Personal appearance
- Body size
- Race
- Ethnicity
- Age
- Religion
- Nationality

### Our Standards

Examples of behavior that contributes to a positive environment:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

Examples of unacceptable behavior:
- Trolling, insulting/derogatory comments, and personal attacks
- Public or private harassment
- Publishing others' private information without permission
- Other conduct which could reasonably be considered inappropriate

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates.

When creating a bug report, include:
- **Clear title and description**
- **Steps to reproduce** the behavior
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Environment details:**
  - OS (macOS, Linux, Windows)
  - Browser (if frontend issue)
  - Python version (if backend issue)
  - Node.js version (if frontend issue)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case:** Why is this enhancement useful?
- **Proposed solution:** How should it work?
- **Alternatives considered:** What other approaches did you consider?
- **Additional context:** Screenshots, mockups, etc.

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Simple issues perfect for newcomers
- `help wanted` - Issues where we need community help

### Knowledge Base Contributions

One of the easiest ways to contribute is by improving the knowledge base with more Irish tenancy law rules:

1. Research a specific aspect of Irish tenancy law
2. Add or update rules in `backend/app/rules/`
3. Include official RTB sources
4. Test that the rule is detected correctly

Example rule structure:
```json
{
  "rule_id": "RNT001",
  "topic": "Rent Increases in RPZ",
  "category": "Rent",
  "summary": "Rent can only increase by 2% or HICP",
  "explanation": "Plain language explanation...",
  "legal_reference": "Planning and Development Act 2016",
  "legal_url": "https://www.rtb.ie/...",
  "keywords": ["rent increase", "rpz", "rent pressure zone"],
  "alert_if_found": ["rent increase of 10%"],
  "severity": "High",
  "recommended_action": "Contact RTB immediately...",
  "source_url": "https://www.rtb.ie/..."
}
```

## Development Setup

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **Git**
- **Google API key** with Gemini access

### Setup Steps

1. **Fork the repository** on GitHub

2. **Clone your fork:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Hestia-AI-Advocate-for-Tenants.git
   cd Hestia-AI-Advocate-for-Tenants
   ```

3. **Set up the backend:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt

   # Create .env file
   echo "GOOGLE_API_KEY=your_key_here" > .env
   ```

4. **Set up the frontend:**
   ```bash
   cd ..  # Back to root directory
   npm install
   ```

5. **Create a branch** for your work:
   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **Start development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   python -m app.main

   # Terminal 2 - Frontend
   npm run dev
   ```

7. **Verify setup:**
   - Frontend: http://localhost:3002
   - Backend health check: http://localhost:8001/health

## Coding Guidelines

### General Principles

- **Write clear, readable code** over clever code
- **Add comments** for complex logic
- **Follow existing patterns** in the codebase
- **Keep functions small** and focused
- **Don't over-engineer** - keep it simple

### Python (Backend)

**Style:**
- Follow [PEP 8](https://pep8.org/)
- Use type hints where appropriate
- Maximum line length: 120 characters

**Naming:**
- `snake_case` for functions and variables
- `PascalCase` for classes
- `UPPER_SNAKE_CASE` for constants

**Example:**
```python
def analyze_rent_fairness(address: str, rent: float) -> Dict[str, Any]:
    """
    Analyze if a rent price is fair and legal.

    Args:
        address: The property address
        rent: Monthly rent in euros

    Returns:
        Dictionary with analysis results
    """
    # Implementation
    pass
```

**Documentation:**
- Add docstrings to all public functions
- Use Google-style docstrings
- Include parameter types and return types

**Error Handling:**
- Catch specific exceptions, not generic `Exception`
- Log errors with context
- Return user-friendly error messages

### TypeScript/React (Frontend)

**Style:**
- Use functional components with hooks
- Follow existing component patterns
- Use TypeScript strict mode
- Maximum line length: 120 characters

**Naming:**
- `camelCase` for functions and variables
- `PascalCase` for components and interfaces
- `UPPER_SNAKE_CASE` for constants

**Example:**
```typescript
interface AnalysisResult {
  keyTerms: KeyTerms;
  alerts: Alert[];
  goodToKnow: GoodToKnow[];
}

export default function LeaseAnalyzer() {
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Component logic

  return (
    <div>
      {/* JSX */}
    </div>
  );
}
```

**Component Organization:**
- One component per file
- Export default for components
- Co-locate related components
- Use descriptive file names

**State Management:**
- Use React hooks (useState, useEffect, etc.)
- Keep state as local as possible
- Lift state up when needed by multiple components

### Git Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): subject

body

footer
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic changes)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(lease-analyzer): add detection for missing notice period clause

Add logic to detect when a lease is missing the required notice
period clause. This helps tenants identify potentially problematic
leases before signing.

Closes #123
```

```
fix(rent-checker): correct RPZ detection for Cork addresses

The RPZ detection was incorrectly classifying some Cork addresses.
Updated the logic to properly check against electoral areas.

Fixes #456
```

## Testing

### Running Tests

**Backend:**
```bash
cd backend
pytest
```

**Frontend:**
```bash
npm test
```

### Writing Tests

**Backend Tests (pytest):**
```python
def test_validate_address():
    """Test address validation logic."""
    # Valid address
    is_valid, error = validate_address("123 Main St, Dublin")
    assert is_valid is True
    assert error is None

    # Invalid address (too short)
    is_valid, error = validate_address("abc")
    assert is_valid is False
    assert "too short" in error.lower()
```

**Frontend Tests (Jest/React Testing Library):**
```typescript
import { render, screen } from '@testing-library/react';
import LeaseAnalyzer from './LeaseAnalyzer';

test('renders file upload component', () => {
  render(<LeaseAnalyzer />);
  const uploadText = screen.getByText(/upload your lease/i);
  expect(uploadText).toBeInTheDocument();
});
```

### Test Coverage

- Aim for **80%+ code coverage**
- Focus on critical paths and edge cases
- Test both success and failure scenarios

## Submitting Changes

### Pull Request Process

1. **Update documentation** if needed (README, API docs, etc.)

2. **Test your changes:**
   ```bash
   # Run tests
   pytest  # Backend
   npm test  # Frontend

   # Manual testing
   npm run start-all
   ```

3. **Commit your changes** with descriptive messages

4. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a Pull Request** on GitHub

6. **Fill out the PR template:**
   - Description of changes
   - Related issue number
   - Testing performed
   - Screenshots (if UI changes)

### Pull Request Guidelines

- **One feature per PR** - keep PRs focused
- **Update tests** if changing functionality
- **Add documentation** for new features
- **Keep commits clean** - consider squashing
- **Respond to feedback** promptly

### Code Review Process

1. **Automated checks** must pass (linting, tests)
2. **At least one approval** from a maintainer
3. **All conversations resolved**
4. **No merge conflicts**

Maintainers will review your PR and may:
- Request changes
- Ask questions for clarification
- Suggest improvements
- Approve and merge

## Development Resources

### Irish Tenancy Law Resources

- [Residential Tenancies Board (RTB)](https://www.rtb.ie/)
- [Citizens Information](https://www.citizensinformation.ie/en/housing/renting-a-home/)
- [Threshold](https://www.threshold.ie/)
- [Housing Agency](https://www.housingagency.ie/)

### Technical Documentation

- [Flask Documentation](https://flask.palletsprojects.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Google Gemini AI Documentation](https://ai.google.dev/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

### Project Documentation

- [README.md](./README.md) - Project overview
- [INTERVIEW_NOTES.md](./INTERVIEW_NOTES.md) - Technical deep dive
- [API.md](./API.md) - API reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide

## Questions?

- **GitHub Issues:** For bugs and feature requests
- **GitHub Discussions:** For questions and general discussion

## License

By contributing, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to Hestia! Your efforts help make rental housing fairer for everyone.** 🏠✨
