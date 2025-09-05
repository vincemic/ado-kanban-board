# Azure DevOps Kanban Board

A modern Angular application that provides a Kanban-style interface for managing Azure DevOps work items with drag-and-drop functionality.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.2.2.

## Features

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

1. **Login**: Enter your Azure DevOps organization URL, project name, and Personal Access Token
2. **View Board**: See your work items organized in columns by state
3. **Drag & Drop**: Move work items between columns to change their state
4. **Create Work Items**: Click the "New Work Item" button to add new items
5. **Edit Work Items**: Click on any work item to edit its details
6. **Refresh**: Use the refresh button to reload data from Azure DevOps

## Development server

To start a local development server, run:

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