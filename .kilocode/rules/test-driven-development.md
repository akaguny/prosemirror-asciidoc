## Brief overview
Guidelines for methodical test-driven development approach when improving integration modules, focusing on systematic testing and bidirectional conversion validation.

## Testing strategy
- Run comprehensive test suites to identify all failure patterns before implementing fixes
- Address test failures systematically, one category at a time (parser, serializer, integration)
- Validate both parsing and serialization directions for each feature
- Ensure roundtrip consistency (parse → serialize → parse) for all supported features

## Integration module development
- Research external dependencies (AsciiDoc, ProseMirror) using available documentation tools
- Create detailed implementation plans mapping test requirements to code components
- Implement parser and serializer components with equal attention to both directions
- Handle edge cases and special character escaping properly

## Code improvement workflow
- Use todo lists to track progress across multiple related issues
- Fix issues in logical order: parser first, then serializer, then integration
- Test frequently during development to catch regressions early
- Preserve existing functionality while adding new capabilities

## Quality assurance
- Verify all test categories pass: basic elements, complex structures, edge cases
- Ensure graceful handling of unsupported features with informative fallbacks
- Maintain bidirectional conversion accuracy for supported markup
- Document limitations and fallback behaviors clearly