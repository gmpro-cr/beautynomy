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
- **Deployment**:
  - Backend: Render (configured in `Beautynomy/render.yaml`)
  - Frontend: Vercel (configured in `Beautynomy/client/vercel.json`)
- **Data**: In-memory data from `products-data.js` (204 products, no database)

## Development Commands

### Server
```bash
cd Beautynomy/server
npm install
npm start  # Runs on http://localhost:5000
```

### Testing the API
- Health check: `GET http://localhost:5000/`
- Get all products: `GET http://localhost:5000/api/products`
- Search products: `GET http://localhost:5000/api/products?query=serum`
- Filter by category: `GET http://localhost:5000/api/products?category=Foundation`
- Filter by brand: `GET http://localhost:5000/api/products?brand=LAKME`
- Get brands: `GET http://localhost:5000/api/brands`
- Get categories: `GET http://localhost:5000/api/categories`
- Get stats: `GET http://localhost:5000/api/stats`

## API Structure

### Endpoints

**GET /**
- Returns server health status and API information

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
- Server uses product data from `products-data.js` (204 products across 21 categories)
- Products cover Foundation, Concealer, Primer, Eyeshadow, Mascara, Eyeliner, Lipstick, Lip Gloss, Blush, Bronzer, Highlighter, Skincare, Hair Care, and Nail Polish
- 76 brands ranging from budget to luxury (Maybelline to Charlotte Tilbury)
- All products include prices from 5 platforms: Nykaa, Amazon, Flipkart, Purplle, Myntra
- Empty directories exist for future structure:
  - `models/` - Future database models
  - `routes/` - Future route handlers
  - `config/` - Future configuration files

### Frontend
- React 18 + Vite 5 application with Tailwind CSS
- Client source files in `client/src/` including App.jsx, main.jsx, index.css
- Features: Wishlist, Product Comparison, Advanced Filters, Price Sorting
- 7 pages: Home, About, Contact, Wishlist, Compare, Privacy, Terms
- Mobile-responsive design with Fenty Beauty-inspired UI
- Connects to backend API via VITE_API_URL environment variable

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
