# Deployment Guide

This document provides detailed information about deploying the Azure DevOps Kanban Board application.

## GitHub Pages Deployment

### Automatic Deployment

The application is automatically deployed to GitHub Pages using GitHub Actions:

- **Repository**: [vincemic/ado-kanban-board](https://github.com/vincemic/ado-kanban-board)
- **Live URL**: [https://vincemic.github.io/ado-kanban-board/](https://vincemic.github.io/ado-kanban-board/)
- **Trigger**: Every push to the `main` branch
- **Build**: Angular production build with base href configured for GitHub Pages

### Workflow Configuration

The deployment uses two GitHub Actions workflows:

1. **Playwright Tests (Non-blocking)** (`.github/workflows/playwright.yml`)
   - Runs E2E tests on every push and pull request
   - Uses `continue-on-error: true` to prevent test failures from blocking deployment
   - Uploads test reports as artifacts
   - Comments on PRs when tests fail

2. **Deploy to GitHub Pages** (`.github/workflows/deploy.yml`)
   - Builds the Angular application for production
   - Configures the correct base href for GitHub Pages
   - Deploys to GitHub Pages using official actions
   - Runs independently of test results

### Manual Deployment

To manually trigger a deployment:

1. Navigate to the [Actions tab](https://github.com/vincemic/ado-kanban-board/actions)
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow"
4. Choose the branch (usually `main`)
5. Click "Run workflow" button

### Local GitHub Pages Testing

To test the GitHub Pages build locally:

```bash
# Install dependencies
npm install

# Build for GitHub Pages (with correct base href)
npm run build -- --base-href=/ado-kanban-board/

# Serve locally (requires http-server)
npx http-server dist/ado-kanban-board -p 8080

# Visit http://localhost:8080 to test
```

## Test Strategy

### Non-blocking Tests

The deployment strategy uses "non-blocking" tests, which means:

- **Continuous Delivery**: New features and fixes are deployed immediately
- **Quality Feedback**: Tests still run and provide feedback to developers
- **User Experience**: Users always have access to the latest version
- **Developer Notifications**: Failed tests trigger alerts for investigation

### Benefits

1. **High Availability**: The demo site is always accessible with the latest code
2. **Fast Iteration**: No waiting for test fixes to deploy urgent changes
3. **Quality Metrics**: Test results are still tracked and reported
4. **Flexible Response**: Critical issues can be addressed without test blockers

### Best Practices

- Monitor test results regularly
- Address test failures promptly
- Use feature flags for experimental features
- Maintain test coverage for critical paths

## Alternative Deployment Options

### Netlify

1. Connect your GitHub repository to Netlify
2. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist/ado-kanban-board`
3. Enable automatic deployments on push

### Vercel

1. Import project from GitHub
2. Configure framework preset: Angular
3. Set output directory: `dist/ado-kanban-board`
4. Deploy automatically on push

### Azure Static Web Apps

1. Use the Azure CLI or Azure Portal
2. Connect to your GitHub repository
3. Configure build settings for Angular
4. Enable automatic deployments

### AWS S3 + CloudFront

1. Build the application: `npm run build`
2. Upload `dist/ado-kanban-board` contents to S3 bucket
3. Configure S3 for static website hosting
4. Set up CloudFront distribution for HTTPS and global CDN

## Configuration Notes

### Base Href

For GitHub Pages deployment, the application uses:
```
--base-href=/ado-kanban-board/
```

This ensures all assets load correctly from the subdirectory path.

### Environment Configuration

The application automatically detects the environment and:
- Uses mock mode by default in the demo
- Handles different base URLs correctly
- Maintains localStorage functionality across deployments

### CORS Considerations

The application makes requests to Azure DevOps APIs, which support CORS for browser requests. No additional configuration is needed for most deployments.

## Monitoring and Maintenance

### Deployment Status

- Check deployment status in GitHub Actions
- Monitor the live site for functionality
- Review test reports for quality metrics

### Updates

- Keep dependencies updated regularly
- Monitor Angular and Node.js versions
- Update GitHub Actions when needed

### Troubleshooting

Common deployment issues:

1. **Build Failures**: Check Node.js version compatibility
2. **Asset Loading**: Verify base href configuration
3. **Routing Issues**: Ensure proper SPA configuration
4. **Test Failures**: Review test reports and fix systematically

For support, check the [GitHub Issues](https://github.com/vincemic/ado-kanban-board/issues) or create a new issue.
