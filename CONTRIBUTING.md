# SynapseMind Contributing Guide

Thank you for your interest in contributing to SynapseMind!

## Code of Conduct

Please be respectful and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).

## How to Contribute

### Reporting Bugs

1. Search existing issues
2. Create a new issue with:
   - Clear title
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details

### Suggesting Features

1. Open a discussion first
2. Describe the problem you're solving
3. Propose a solution
4. Gather feedback

### Pull Requests

1. Keep PRs focused and small
2. Follow coding standards
3. Add tests for new features
4. Update documentation
5. Use conventional commits

## Development Setup

See [README.md](./README.md) for setup instructions.

## Coding Standards

### TypeScript

```typescript
// Use strict typing
interface User {
  id: string;
  name: string;
  email: string;
}

// Use functional patterns
const getUserName = (user: User): string => user.name;
```

### Python (AI Service)

```python
# Use type hints
from typing import Optional

def process_document(document: Document) -> ProcessingResult:
    ...
```

### Git Commits

```
feat: add knowledge graph visualization
fix: resolve review card generation
docs: update API documentation  
refactor: optimize graph queries
test: add integration tests
chore: update dependencies
```

## Testing

```bash
# Backend tests
npm run test          # Unit tests
npm run test:e2e     # E2E tests

# Frontend tests
npm run test         # Jest tests
npm run test:e2e    # Playwright tests
```

## Questions?

Join our Discord or open a discussion.
