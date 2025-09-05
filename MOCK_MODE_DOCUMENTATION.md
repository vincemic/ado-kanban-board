# Mock Mode Documentation

## Overview

The application supports a mock mode for testing and development purposes. Mock mode simulates Azure DevOps API responses without requiring actual Azure DevOps credentials or connectivity.

## Enabling Mock Mode

### Method 1: Query String Parameter (Recommended)

Add the `mock=true` query parameter to any URL:

```text
http://localhost:4200/?mock=true
http://localhost:4200/login?mock=true
http://localhost:4200/board?mock=true
```

### Method 2: Programmatic Control

You can also control mock mode programmatically using the `AppConfigService`:

```typescript
// Enable mock mode
this.appConfigService.setMockMode(true);

// Disable mock mode
this.appConfigService.setMockMode(false);

// Toggle mock mode
this.appConfigService.toggleMockMode();

// Check current mock mode status
const isMockMode = this.appConfigService.useMockServices;
```

## Persistence

Mock mode settings are persisted in localStorage, so once enabled via query parameter, the setting will remain active across page refreshes and navigation until:

1. The query parameter `mock=false` is used
2. Mock mode is disabled programmatically
3. localStorage is cleared

## Mock Data

When mock mode is enabled, the application uses `MockAzureDevOpsService` which provides:

- **Mock Projects**: Sample Project, Demo Project, Test Project
- **Mock Work Items**: Various work items with different states (New, Active, Resolved, Closed)
- **Mock Teams**: Development Team, QA Team, Design Team
- **Mock Iterations**: Current Sprint, Next Sprint, Backlog

## Implementation Details

### Service Factory Pattern

The `AzureDevOpsServiceFactory` determines which service to use based on the mock mode setting:

```typescript
getService(): AzureDevOpsService | MockAzureDevOpsService {
  return this.config.useMockServices ? this.mockService : this.realService;
}
```

### Configuration Service

The `AppConfigService` manages mock mode state with the following priority:

1. **Query Parameter** (highest priority): `?mock=true` or `?mock=false`
2. **Stored Preference**: Previously saved setting in localStorage
3. **Default**: Production mode (false)

### URL Parameter Detection

Mock mode is automatically detected on application startup by checking `window.location.search` for the `mock` parameter.

## Testing with Mock Mode

### Playwright Tests

All Playwright tests should use mock mode to ensure reliable, fast, and isolated testing:

```typescript
test('should test functionality', async ({ page }) => {
  // Navigate with mock mode enabled
  await page.goto('/?mock=true');
  
  // Your test code here
});
```

### Development Testing

For manual testing during development:

1. Start the development server: `npm run serve`
2. Navigate to `http://localhost:4200/?mock=true`
3. Use any organization name and access token (they will be ignored in mock mode)
4. Select from the available mock projects

## Mock Mode Indicators

When mock mode is active:

- Console logs will indicate "Mock mode enabled via query parameter" or "Mock mode enabled from stored preference"
- The login form will accept any credentials and show mock projects
- The kanban board will display mock work items
- All API calls will be handled by the mock service

## Disabling Mock Mode

To return to production mode:

1. **URL Method**: Navigate to `/?mock=false`
2. **Clear Storage**: Clear localStorage or use browser dev tools
3. **Programmatic**: Call `appConfigService.setMockMode(false)`

## Security Considerations

- Mock mode is intended for development and testing only
- In production deployments, consider adding environment-based restrictions to prevent accidental activation
- Mock data should not contain sensitive information
- Always verify that production builds don't accidentally ship with mock mode enabled by default

## Troubleshooting

### Mock Mode Not Working

1. Check the browser console for mock mode status messages
2. Verify the query parameter syntax: `?mock=true` (not `?mock=1` or `?mock=yes`)
3. Clear localStorage if switching between modes
4. Ensure the URL parameter is properly encoded

### Mock Data Not Appearing

1. Verify that `MockAzureDevOpsService` is properly registered in the service factory
2. Check that the service factory is returning the correct service instance
3. Look for any console errors during service initialization

### Tests Failing

1. Ensure all test URLs include `?mock=true`
2. Verify that test data expectations match the mock service responses
3. Check that authentication state is properly mocked in tests
