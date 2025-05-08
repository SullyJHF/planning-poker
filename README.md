# Planning Poker

A real-time planning poker web application built with React, TypeScript, Node.js, Express, and Socket.IO.

## Project Structure

- `client/` - React frontend application
- `server/` - Node.js backend server

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Setup

1. Install dependencies for both client and server:
```bash
npm install
```

2. Create a `.env` file in the client directory with:
```
REACT_APP_SERVER_URL=http://localhost:3001
```

## Running the Application

1. Start both client and server in development mode:
```bash
npm start
```

This will start:
- Frontend on http://localhost:3000
- Backend on http://localhost:3001

## Development

- Client development server: `npm run start:client`
- Server development server: `npm run start:server`

## Building for Production

To build both client and server:
```bash
npm run build
``` 
