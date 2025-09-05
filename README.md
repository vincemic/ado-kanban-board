# Azure DevOps Kanban Board

A modern Angular application that provides a Kanban-style interface for managing Azure DevOps work items with drag-and-drop functionality.

🌐 **[Try the Live Demo](https://vincemic.github.io/ado-kanban-board/)** - No setup required! Use mock mode to explore all features.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.2.2.

## Live Demo

🌐 **[Try the Live Demo](https://vincemic.github.io/ado-kanban-board/)** 

The application is automatically deployed to GitHub Pages whenever changes are pushed to the main branch. You can explore all features using the mock mode:

1. Visit the [live demo](https://vincemic.github.io/ado-kanban-board/)
2. The demo starts in mock mode by default (toggle available on login page)
3. Use any organization name (e.g., "demo-org") and token (e.g., "demo-token")
4. Explore the full Kanban board functionality with sample data

**Features available in the demo:**
- Full drag-and-drop functionality
- Work item creation and editing
- Responsive design across devices
- All UI components and interactions

**Note:** The demo uses mock data and doesn't connect to real Azure DevOps services.

## Getting Started

- 🔐 **Authentication**: Connect to any Azure DevOps organization using Personal Access Tokens
- 📋 **Kanban Board**: Visual board with columns representing work item states
- 🎯 **Drag & Drop**: Move work items between states with intuitive drag-and-drop
- ✏️ **Work Item Management**: Create, edit, and delete work items
- 🏷️ **Rich Metadata**: Support for work item types, priorities, tags, and assignments
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Material Design**: Modern UI using Angular Material components

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- An Azure DevOps organization and project
- Personal Access Token with Work Items (read & write) permissions

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ado-kanban-board
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
ng serve
```

4. Open your browser and navigate to `http://localhost:4200`

### Azure DevOps Setup

1. Go to your Azure DevOps organization
2. Navigate to **User Settings** > **Personal Access Tokens**
3. Create a new token with **Work Items (read & write)** permissions
4. Copy the token for use in the application

### Using the Application

1. **Login**: Enter your Azure DevOps organization name and Personal Access Token
2. **Mock Mode**: Toggle mock mode for testing with sample data (no real Azure DevOps connection required)
3. **View Board**: See your work items organized in columns by state
4. **Drag & Drop**: Move work items between columns to change their state
5. **Create Work Items**: Click the "New Work Item" button to add new items
6. **Edit Work Items**: Click on any work item to edit its details
7. **Refresh**: Use the refresh button to reload data from Azure DevOps

### Mock Mode for Testing

The application includes a mock mode for testing purposes:

- **URL Parameter**: Add `?mock=true` to any URL to enable mock mode (e.g., `http://localhost:4200/login?mock=true`)
- **Toggle Button**: Use the toggle button on the login page to switch between real and mock modes
- **Sample Data**: Mock mode provides realistic sample work items and projects
- **Local Storage**: Your mock mode preference is saved locally

Mock mode is perfect for:
- Testing the application without Azure DevOps access
- Demonstrating functionality
- Development and debugging
- E2E testing

**Note**: Query parameters are preserved when navigating directly to specific pages (e.g., `/login?mock=true`, `/board?mock=true`)

## Quick Testing

### Test with Mock Data (No Azure DevOps Required)

1. Start the development server:
```bash
ng serve
```

2. Open your browser to `http://localhost:4200?mock=true`

3. Or use the toggle button on the login page to switch to mock mode

4. When in mock mode:
   - Organization name can be anything (e.g., "testorg")
   - PAT token can be anything (e.g., "fake-token")
   - You'll see sample projects and work items
   - All drag-and-drop functionality works with mock data

### Test with Real Azure DevOps

1. Ensure you have an Azure DevOps organization and PAT token
2. Start the application normally: `ng serve`
3. Navigate to `http://localhost:4200`
4. Enter your real organization name and PAT token
5. Connect to your actual Azure DevOps projects


```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── login/                 # Authentication component
│   │   ├── kanban-board/         # Main Kanban board
│   │   └── work-item-dialog/     # Work item creation/editing dialog
│   ├── models/
│   │   └── work-item.model.ts    # Data models
│   ├── services/
│   │   ├── auth.service.ts       # Authentication service
│   │   └── azure-devops.service.ts # Azure DevOps API integration
│   └── ...
```

## Technologies Used

- **Angular 18+**: Latest version with standalone components
- **Angular Material**: UI component library
- **Angular CDK**: Drag & drop functionality
- **RxJS**: Reactive programming
- **TypeScript**: Type-safe development
- **Azure DevOps REST API**: Work item management

## API Integration

The application integrates with the Azure DevOps REST API to:

- Query work items using WIQL (Work Item Query Language)
- Update work item states
- Create new work items
- Retrieve work item types and states

## Security Note

Personal Access Tokens are stored in browser localStorage for convenience in this demo. In a production environment, consider implementing more secure authentication methods such as:

- Azure Active Directory integration
- OAuth 2.0 flows
- Server-side token management

## Development

### Building for Production

```bash
ng build --prod
```

### End-to-End Testing

This project uses Playwright for end-to-end testing. Tests cover:

- Login functionality and form validation
- Kanban board display and interactions
- Work item creation and editing
- Drag and drop functionality
- Responsive design and accessibility

#### Running E2E Tests

```bash
# Run all tests headless
npm run e2e

# Run tests with browser UI visible
npm run e2e:headed

# Run tests with Playwright UI mode (interactive)
npm run e2e:ui

# Show test report
npm run e2e:report
```

#### Supported Browsers

Tests run on:
- Chromium
- WebKit (Safari engine)
- Microsoft Edge
- Mobile Chrome
- Mobile Safari

Note: Firefox is excluded from the test configuration.

### Linting

```bash
ng lint
```

## Deployment

### GitHub Pages

The application is automatically deployed to GitHub Pages using GitHub Actions:

- **Live URL**: [https://vincemic.github.io/ado-kanban-board/](https://vincemic.github.io/ado-kanban-board/)
- **Deployment**: Automatic on every push to `main` branch
- **Build Process**: Angular production build with GitHub Pages base href
- **Testing**: Playwright tests run but don't block deployment (non-blocking)

#### Continuous Integration

The repository uses GitHub Actions for CI/CD:

**Workflows:**
- **Playwright Tests (Non-blocking)**: Runs E2E tests on every push and PR, but failures don't block deployment
- **Deploy to GitHub Pages**: Automatically deploys the app when changes are pushed to main

**Test Strategy:**
- Tests provide feedback on functionality
- Deployment continues even if tests fail to ensure continuous delivery
- Test failures are reported but don't prevent users from accessing the latest version
- Failed tests trigger notifications for developers to investigate and fix

This approach prioritizes availability while maintaining quality feedback loops.

#### Manual Deployment

You can manually trigger a deployment:

1. Go to the "Actions" tab in the GitHub repository
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow" button

#### Local GitHub Pages Testing

To test the GitHub Pages build locally:

```bash
# Build for GitHub Pages
npm run build -- --base-href=/ado-kanban-board/

# Serve the built files (requires a local server)
npx http-server dist/ado-kanban-board
```

### Other Deployment Options

The application can be deployed to any static hosting service:

- **Netlify**: Connect your repository for automatic deployments
- **Vercel**: Import project for serverless deployment  
- **Azure Static Web Apps**: Deploy directly to Azure
- **AWS S3**: Upload build files to S3 bucket with static hosting

For production deployments, run:

```bash
ng build --configuration production
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Troubleshooting

### Common Issues

1. **Authentication Failed**: Ensure your Personal Access Token has the correct permissions
2. **CORS Errors**: Azure DevOps APIs support CORS for browser requests
3. **Work Items Not Loading**: Check your project name and organization URL

### Getting Help

- Check the browser console for error messages
- Verify your Azure DevOps permissions
- Ensure the organization URL format is correct: `https://dev.azure.com/yourorg`

## Future Enhancements

- [ ] Swimlanes support
- [ ] Advanced filtering and search
- [ ] Bulk operations
- [ ] Custom fields support
- [ ] Offline support
- [ ] Real-time updates
- [ ] Azure AD authentication
- [ ] Charts and reporting
