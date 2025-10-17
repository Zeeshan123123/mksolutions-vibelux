# VibeLux CAD System Test Suite

This directory contains comprehensive tests for the VibeLux CAD system, covering all major components and functionality.

## Test Structure

### Unit Tests
- **cad-system.test.ts** - Core CAD system functionality
- **collaboration.test.ts** - Real-time collaboration features
- **database.test.ts** - Database persistence layer
- **export.test.ts** - CAD export engine

### Test Categories

#### 1. CAD System Tests (`cad-system.test.ts`)
- Greenhouse model creation and validation
- 3D geometry engine functionality
- Material database operations
- BOM generation and optimization
- Technical drawing generation
- Structural analysis and FEA solver
- CAD export to various formats
- Project integration and workflow

#### 2. Collaboration Tests (`collaboration.test.ts`)
- User authentication and session management
- Real-time component operations
- Lock management and conflict resolution
- Cursor and selection tracking
- Comments and annotations
- Permission enforcement
- Multi-user scenarios

#### 3. Database Tests (`database.test.ts`)
- Project CRUD operations
- Model and component persistence
- Version control and branching
- Query optimization and caching
- Transaction management
- Backup and restore functionality
- Performance testing

#### 4. Export Tests (`export.test.ts`)
- Multi-format CAD export (DXF, DWG, STEP, IGES, IFC, STL, OBJ, glTF)
- Drawing export to PDF/SVG
- Layer configuration and management
- Export validation and error handling
- Performance testing for large models

## Running Tests

### All Tests
```bash
npm test
```

### CAD System Tests Only
```bash
npm run test:cad
```

### Specific Test Files
```bash
# Run CAD system tests
npm test cad-system.test.ts

# Run collaboration tests
npm test collaboration.test.ts

# Run database tests
npm test database.test.ts

# Run export tests
npm test export.test.ts
```

### Test Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

## Test Configuration

### Jest Configuration
The test suite uses Jest with the following key configurations:
- **Environment**: jsdom for DOM-based testing
- **Setup**: Comprehensive mocking of external dependencies
- **Coverage**: 70% threshold for branches, functions, lines, and statements
- **Timeout**: 30 seconds for complex operations
- **Workers**: 50% of available CPU cores

### Mocked Dependencies
The test suite includes mocks for:
- **THREE.js** - 3D graphics library
- **Socket.IO** - Real-time communication
- **Redis** - Caching and session storage
- **Prisma** - Database ORM
- **File System** - Node.js fs operations
- **Canvas** - Server-side rendering
- **WebGL** - 3D graphics context

## Test Data

### Mock Greenhouse Parameters
```typescript
const mockGreenhouseParams = {
  name: 'Test Greenhouse',
  dimensions: { length: 100, width: 50, height: 15 },
  structure: {
    type: 'gable',
    frameType: 'galvanized_steel',
    baySpacing: 10,
    postSpacing: 8,
    roofPitch: 30,
    foundationType: 'concrete_stem'
  },
  glazing: {
    roofType: 'polycarbonate',
    wallType: 'tempered_glass',
    thickness: 8,
    uValue: 0.7,
    lightTransmission: 0.85
  },
  systems: {
    ventilation: { type: 'ridge_furrow', capacity: 5000 },
    heating: { type: 'radiant_floor', capacity: 500000 },
    cooling: { type: 'evaporative', capacity: 250000 }
  }
};
```

### Mock Users
```typescript
const mockUser1 = {
  id: 'user1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'editor',
  permissions: { canEdit: true, canDelete: true, canExport: true }
};
```

## Performance Testing

### Load Testing
- Large model creation (1000+ components)
- Batch export operations
- Multiple concurrent users
- Database query optimization

### Benchmarks
- Model creation: < 5 seconds for large models
- Export operations: < 10 seconds per format
- Collaboration: < 100ms response times
- Database queries: < 500ms for complex operations

## Debugging Tests

### Verbose Output
```bash
npm test -- --verbose
```

### Debug Specific Test
```bash
npm test -- --testNamePattern="should create greenhouse model"
```

### Coverage Reports
Coverage reports are generated in the `coverage/` directory:
- `coverage/lcov-report/index.html` - HTML coverage report
- `coverage/lcov.info` - LCOV format for CI/CD
- `coverage/coverage-final.json` - JSON coverage data

## Continuous Integration

The test suite is designed to run in CI/CD environments:
- **GitHub Actions** - Automated testing on push/PR
- **Coverage Reporting** - Integrated with codecov.io
- **Test Results** - JUnit XML format for CI parsing
- **Performance Monitoring** - Benchmark tracking

## Test Utilities

### Mock Helpers
```typescript
// Available in setup.ts
import { mockPrisma, mockEventEmitter, mockWebGLContext } from './setup';
```

### Custom Matchers
```typescript
// Example custom matcher usage
expect(result).toBeValidCADModel();
expect(export).toHaveCorrectFormat('dxf');
```

## Best Practices

1. **Test Isolation** - Each test is independent and can run in any order
2. **Mocking** - External dependencies are mocked for consistent results
3. **Assertions** - Clear, descriptive assertions with meaningful error messages
4. **Coverage** - Comprehensive coverage of all critical paths
5. **Performance** - Tests include performance benchmarks and timeouts
6. **Documentation** - Each test clearly describes what it's testing

## Contributing

When adding new tests:
1. Follow the existing test structure and naming conventions
2. Include both positive and negative test cases
3. Add performance tests for CPU/memory intensive operations
4. Update this README with new test categories
5. Ensure tests pass in both development and CI environments

## Troubleshooting

### Common Issues

1. **Memory Leaks** - Use `--detectOpenHandles` flag to identify leaks
2. **Timeout Issues** - Increase timeout for complex operations
3. **Mock Failures** - Ensure all external dependencies are properly mocked
4. **Coverage Issues** - Check that all code paths are tested

### Debug Commands
```bash
# Run with debug output
npm test -- --verbose --no-coverage

# Run specific test file
npm test cad-system.test.ts

# Run with leak detection
npm test -- --detectOpenHandles

# Run with maximum workers
npm test -- --maxWorkers=100%
```