# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Beautynomy is a beauty product price comparison platform that aggregates pricing from multiple Indian e-commerce platforms (Nykaa, Amazon, Flipkart) with affiliate link integration.

## Repository Structure

This is a monorepo containing:
- `Beautynomy/server/` - Express.js backend API
- `Beautynomy/client/` - React frontend (with Tailwind CSS configuration)
- Root `package.json` - Contains shared dependencies for Tailwind CSS

**Note**: There's a duplicate server structure with files at both `Beautynomy/server/server.js` and `Beautynomy/server/server/server.js`. The active server file is at `Beautynomy/server/server.js`.

## Technology Stack

- **Backend**: Express.js (ES modules, using `"type": "module"`)
- **Frontend**: React with Tailwind CSS
- **Deployment**: Vercel (configured in `Beautynomy/server/vercel.json`)
- **Data**: Currently uses in-memory mock data (no database connected)

## Development Commands

### Server
```bash
cd Beautynomy/server
npm install
npm start  # Runs on http://localhost:5000
```

### Testing the API
- Health check: `GET http://localhost:5000/api/health`
- Get products: `GET http://localhost:5000/api/products?query=serum&category=Skincare&brand=PureGlow`

## API Structure

### Endpoints

**GET /api/health**
- Returns server status

**GET /api/products**
- Query parameters:
  - `query` (string): Searches name, brand, description
  - `category` (string): Filter by category (Face, Lips, Eyes, Skincare, or "All")
  - `brand` (string): Filter by brand (or "All")
- Returns array of product objects

### Product Data Model

Each product contains:
```javascript
{
  id: number,
  name: string,
  brand: string,
  image: string,  // SVG data URI
  description: string,
  category: string,  // "Face" | "Lips" | "Eyes" | "Skincare"
  prices: [
    {
      platform: string,  // "Nykaa" | "Amazon" | "Flipkart"
      price: number,
      link: string,      // Affiliate URL
      rating: number,
      reviews: number
    }
  ]
}
```

## Architecture Notes

### Current State
- Server uses mock data defined in `server.js` (6 sample products)
- Empty directories exist for future structure:
  - `models/` - Future database models
  - `routes/` - Future route handlers
  - `config/` - Future configuration files

### Frontend
- Client source files are not present in `client/src/`
- Tailwind and PostCSS configs exist at `client/client:tailwind.config.js` and `client/client:postcss.config.js`

### Affiliate Links
Products include affiliate links for:
- Nykaa: `?affiliate=beautynomy`
- Amazon: `?tag=beautynomy-21`
- Flipkart: `?affid=beautynomy`

## Deployment

The server is configured for Vercel deployment with the following settings:
- Build command: `npm run build`
- Dev command: `npm run dev`
- Output directory: `dist`

**Note**: The current `package.json` only defines a `start` script. Build/dev scripts need to be added if deploying to Vercel.
