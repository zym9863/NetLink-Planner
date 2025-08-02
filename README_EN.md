# NetLink Planner

**[中文](README.md) | English**

**Network Link Planner - Intelligent Network Transmission Media Selection System**

## Project Overview

NetLink Planner is an intelligent network transmission media selection system that helps users intelligently recommend the most suitable network transmission media and equipment based on network requirements and environmental conditions.

## Technology Stack

### Backend
- **Framework**: NestJS
- **Database**: SQLite (using TypeORM)
- **API Documentation**: Swagger
- **Language**: TypeScript

### Frontend
- **Framework**: Svelte 5
- **Build Tool**: Vite
- **Language**: TypeScript
- **HTTP Client**: Axios

## Project Structure

```
NetLink Planner/
├── backend/                 # Backend service
│   ├── src/
│   │   ├── controllers/     # Controllers
│   │   ├── services/        # Business logic
│   │   ├── entities/        # Data models
│   │   ├── dto/            # Data transfer objects
│   │   └── config/         # Configuration files
│   └── netlink_planner.db  # SQLite database
├── frontend/               # Frontend application
│   └── src/
│       ├── components/     # Svelte components
│       └── lib/           # Utilities and API
└── package.json           # Root project configuration
```

## Features

- 📊 **Media Management**: Manage parameters and characteristics of various network transmission media
- 🤖 **Intelligent Recommendation**: Automatically recommend optimal network solutions based on user requirements
- 📈 **Performance Analysis**: Analyze performance of different media types
- 🎯 **Precise Selection**: Accurate selection based on distance, bandwidth, environment and other factors

## Quick Start

### Requirements

- Node.js >= 18.0.0
- pnpm >= 8.0.0

### Installation

```bash
# Install all dependencies
pnpm run install:all
```

### Development Mode

```bash
# Start both frontend and backend development servers
pnpm run dev

# Or start separately
pnpm run backend:dev    # Backend dev server (default port: 3000)
pnpm run frontend:dev   # Frontend dev server (default port: 5173)
```

### Build & Deploy

```bash
# Build the entire project
pnpm run build

# Start production environment
pnpm run start
```

### Testing

```bash
# Run tests
pnpm run test

# Code linting
pnpm run lint
```

## API Documentation

After starting the backend service, you can access the Swagger API documentation:
- Development: http://localhost:3000/api
- Production: Access via deployment domain

## Project Highlights

1. **Monorepo Architecture**: Uses pnpm workspaces to manage frontend and backend code
2. **Modern Tech Stack**: Uses latest NestJS and Svelte 5
3. **Type Safety**: Full TypeScript usage ensures code quality
4. **Intelligent Recommendation**: Built-in recommendation engine algorithms
5. **Lightweight Database**: Uses SQLite for easy deployment and development

## Development Guide

### Adding New Media Types

1. Update data model in `backend/src/entities/media.entity.ts`
2. Add corresponding DTOs in `backend/src/dto/media.dto.ts`
3. Update business logic in `backend/src/services/media.service.ts`
4. Add UI support in frontend `frontend/src/components/MediaManagement.svelte`

### Optimizing Recommendation Algorithm

The core recommendation algorithm logic is located in `backend/src/services/recommendation.service.ts`, where weights and scoring criteria can be adjusted based on actual requirements.

## License

MIT License

## Contributing

Issues and Pull Requests are welcome to improve this project.