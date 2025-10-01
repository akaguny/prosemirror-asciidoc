## Brief overview
Guidelines for systematic refactoring approach in the prosemirror-asciidoc project, focusing on iterative improvements while maintaining test coverage and code quality.

## Code review process
- Use code-simplifier mode for initial comprehensive review
- Focus on type safety, complexity reduction, and maintainability
- Generate prioritized list of refactoring opportunities
- Document specific issues with concrete examples

## Refactoring workflow
- Establish baseline with full test suite run before changes
- Perform refactoring in small, focused iterations
- Verify tests pass after each significant change
- Maintain core functionality while improving code structure
- Ignore unrelated test failures (e.g., demo/Playwright tests)

## TypeScript best practices
- Replace any types with proper interfaces
- Use TypeScript features for better code documentation
- Leverage type system for error prevention
- Create isolated, well-typed modules

## Code organization
- Break down complex methods into focused functions
- Extract shared logic to reduce duplication
- Use handler maps instead of large switch statements
- Maintain clear separation of concerns

## Error handling
- Centralize error handling and logging
- Provide meaningful error messages
- Use consistent error handling patterns
- Log failures for debugging without silent fails

## Testing strategy
- Run core tests (vitest) frequently during refactoring
- Focus on test/parse.spec.ts and test/integration.spec.ts
- Ensure no regressions in existing functionality
- Add tests for edge cases when needed