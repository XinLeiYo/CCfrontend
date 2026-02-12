# CCFrontend - Equipment Management System

A React-based frontend application for managing equipment and generating reports.

## Tech Stack

- **Framework**: React 19.1
- **Build Tool**: Vite 7.0
- **UI Library**: Ant Design (antd) 5.26
- **Styling**: Tailwind CSS 4.1
- **Routing**: React Router DOM 7.7
- **HTTP Client**: Axios 1.10
- **Date Handling**: Day.js & Moment.js
- **Excel Export**: XLSX 0.18
- **Process Manager**: PM2 (production deployment)

## Features

- 🔐 **Authentication System** - Secure login and session management
- 📊 **Equipment Management** - Add, edit, and track equipment
- 📝 **Report Generation** - Create and manage equipment reports
- 📁 **Batch Operations** - Bulk edit equipment records
- 📤 **Excel Export** - Export data to Excel files
- 🔍 **Search & Filter** - Advanced search functionality
- 📱 **Responsive Design** - Mobile-friendly interface

## Project Structure

```
CCfrontend/
├── src/
│   ├── components/        # Reusable components
│   │   ├── BatchEditModal.jsx
│   │   ├── EquipmentModalForm.jsx
│   │   ├── EquipmentTable.jsx
│   │   ├── LogHistoryModal.jsx
│   │   ├── ReportModal.jsx
│   │   ├── SearchBar.jsx
│   │   └── StatusCards.jsx
│   ├── context/           # React context providers
│   │   ├── AuthContext.jsx
│   │   └── useAuth.jsx
│   ├── pages/             # Page components
│   │   ├── EquipmentPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── ReportListPage.jsx
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
├── public/                # Static assets
├── dist/                  # Build output
├── ecosystem.config.cjs   # PM2 configuration
├── vite.config.js         # Vite configuration
└── package.json           # Dependencies
```

## Prerequisites

- Node.js (v18+ recommended)
- npm or yarn package manager

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

The development server includes a proxy configuration that forwards `/api` requests to the Flask backend at `http://192.168.2.65:5172`.

### Build

```bash
# Build for production
npm run build
```

The production build will be output to the `dist/` directory.

### Preview Production Build

```bash
# Preview production build locally
npm run preview
```

## Production Deployment

This application uses PM2 for process management in production.

### Start with PM2

```bash
# Build the application first
npm run build

# Start with PM2
pm2 start ecosystem.config.cjs

# View application status
pm2 status

# View logs
pm2 logs cc-frontend

# Restart application
pm2 restart cc-frontend

# Stop application
pm2 stop cc-frontend
```

The PM2 configuration serves the built application on port **5173** using the `serve` package.

## API Configuration

The backend API is configured in `vite.config.js`:

```javascript
proxy: {
  '/api': {
    target: 'http://192.168.2.65:5172',
    changeOrigin: true,
  },
}
```

Update the `target` URL to match your backend server location.

## Code Quality

### Linting

```bash
# Run ESLint
npm run lint
```

The project uses ESLint with React-specific rules for code quality.

## Environment Variables

Configure your backend API endpoint in:
- **Development**: `vite.config.js` proxy settings
- **Production**: Update the API base URL in your Axios configuration

## Browser Support

Modern browsers with ES6+ support:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Private project - All rights reserved

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## Support

For issues or questions, please contact the development team.
