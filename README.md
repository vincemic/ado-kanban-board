# Azure DevOps Kanban Board# AdoKanbanBoard



A modern Angular application that provides a Kanban-style interface for managing Azure DevOps work items with drag-and-drop functionality.This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.2.2.



## Features## Development server



- 🔐 **Authentication**: Connect to any Azure DevOps organization using Personal Access TokensTo start a local development server, run:

- 📋 **Kanban Board**: Visual board with columns representing work item states

- 🎯 **Drag & Drop**: Move work items between states with intuitive drag-and-drop```bash

- ✏️ **Work Item Management**: Create, edit, and delete work itemsng serve

- 🏷️ **Rich Metadata**: Support for work item types, priorities, tags, and assignments```

- 📱 **Responsive Design**: Works on desktop and mobile devices

- 🎨 **Material Design**: Modern UI using Angular Material componentsOnce the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.



## Getting Started## Code scaffolding



### PrerequisitesAngular CLI includes powerful code scaffolding tools. To generate a new component, run:



- Node.js (v18 or higher)```bash

- npmng generate component component-name

- An Azure DevOps organization and project```

- Personal Access Token with Work Items (read & write) permissions

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

### Installation

```bash

1. Clone the repository:ng generate --help

```bash```

git clone <repository-url>

cd ado-kanban-board## Building

```

To build the project run:

2. Install dependencies:

```bash```bash

npm installng build

``````



3. Start the development server:This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

```bash

ng serve## Running unit tests

```

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

4. Open your browser and navigate to `http://localhost:4200`

```bash

### Azure DevOps Setupng test

```

1. Go to your Azure DevOps organization

2. Navigate to **User Settings** > **Personal Access Tokens**## Running end-to-end tests

3. Create a new token with **Work Items (read & write)** permissions

4. Copy the token for use in the applicationFor end-to-end (e2e) testing, run:



### Using the Application```bash

ng e2e

1. **Login**: Enter your Azure DevOps organization URL, project name, and Personal Access Token```

2. **View Board**: See your work items organized in columns by state

3. **Drag & Drop**: Move work items between columns to change their stateAngular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

4. **Create Work Items**: Click the "New Work Item" button to add new items

5. **Edit Work Items**: Click on any work item to edit its details## Additional Resources

6. **Refresh**: Use the refresh button to reload data from Azure DevOps

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

### Running Tests
```bash
ng test
```

### Building for Production
```bash
ng build --prod
```

### Linting
```bash
ng lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

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