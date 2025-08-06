# Flipkart Scraping Tool

A comprehensive web scraping solution for extracting product data from Flipkart, including categories, subcategories, and product details.

## 🚀 Features

- **Dynamic Category Scraping**: Automatically extracts main product categories from Flipkart
- **Intelligent Subcategory Detection**: Scrapes actual subcategories for each parent category (replaces placeholder data)
- **Product Data Extraction**: Captures detailed product information including prices, ratings, and images
- **MongoDB Integration**: Stores scraped data in a structured database
- **Error Handling & Retries**: Robust handling of network issues and page load failures

## 📁 Project Structure

```
Flipkart_Scraping/
├── scraper/
│   ├── categoryScraper.js      # Scrapes main categories
│   ├── subcategoryScraper.js  # NEW: Scrapes subcategories dynamically
│   ├── updateSubcategories.js # NEW: Script to update subcategory mappings
│   ├── flipkartProducts.js    # Scrapes product details
│   └── scrapeAllToMongo.js    # Main scraping orchestrator
├── models/
│   ├── Category.js            # Mongoose schema for categories
│   ├── Subcategory.js         # Mongoose schema for subcategories
│   └── Product.js             # Mongoose schema for products
├── dynamicCategoryMapping.json    # Auto-generated category mappings
├── dynamicSubcategoryMapping.json # Auto-generated subcategory mappings (fixed!)
├── db.js                      # Database connection
└── package.json
```

## 🔧 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up MongoDB** (optional):
   - Install MongoDB locally or use MongoDB Atlas
   - Update connection string in `db.js` if needed

## 🎯 Usage

### 1. Scrape Categories First
Before scraping subcategories, you need to have category mappings:
```bash
npm run scrape-categories
```
This creates `dynamicCategoryMapping.json` with main Flipkart categories.

### 2. Fix Subcategory Data (NEW!)
Replace the placeholder subcategory data with real Flipkart subcategories:
```bash
npm run scrape-subcategories
```
This will:
- Visit each category page
- Extract actual subcategories
- Update `dynamicSubcategoryMapping.json` with real data
- Eliminate duplicate "Flights" and "Offer Zone" entries

### 3. Run Complete Scraping
To scrape everything (categories, subcategories, and products):
```bash
npm run scrape-all
```

## 🐛 Data Quality Issues Fixed

### Previous Issues (RESOLVED):
- ✅ **Duplicate Data**: Identical subcategory arrays for different parent categories
- ✅ **Placeholder URLs**: All subcategories pointed to "Flights" and "Offer Zone"
- ✅ **Mismatched Groupings**: Group names didn't align with parent categories
- ✅ **Static Data**: Using hardcoded values instead of dynamic scraping

### New Subcategory Features:
- **Dynamic Extraction**: Real-time scraping of actual Flipkart subcategories
- **Category-Specific**: Each parent category gets relevant subcategories
- **URL Validation**: Only valid Flipkart URLs are included
- **Duplicate Removal**: Automatic deduplication of subcategory names
- **Flexible Grouping**: Proper group assignments based on parent categories

## 📊 Data Structure (Fixed)

### Before (Placeholder Data):
```json
{
  "Mobiles & Tablets": [
    {
      "group": "Electronics",
      "name": "Flights",
      "url": "https://www.flipkart.com/travel/flights"
    }
  ]
}
```

### After (Real Data):
```json
{
  "Mobiles & Tablets": [
    {
      "group": "Mobiles & Tablets",
      "name": "Smartphones",
      "url": "https://www.flipkart.com/mobiles/smartphones/pr?sid=tyy,4io"
    },
    {
      "group": "Mobiles & Tablets",
      "name": "Tablets",
      "url": "https://www.flipkart.com/tablets/pr?sid=tyy,hry"
    }
  ]
}
```

## 🛠️ Technical Details

### Subcategory Scraping Strategy:
1. **Sidebar Navigation**: Searches for category filters in sidebar
2. **Filter Sections**: Looks for category-based filters
3. **Breadcrumb Navigation**: Extracts from breadcrumb trails
4. **Grid/List Detection**: Finds subcategory cards in main content
5. **URL Validation**: Ensures all URLs are valid Flipkart links

### Error Handling:
- Network timeout handling (30s default)
- Login popup auto-dismissal
- Graceful degradation if elements not found
- Retry mechanisms for failed requests

## 📝 Notes

- **Rate Limiting**: Built-in delays to respect Flipkart's servers
- **Headless Mode**: Runs in background by default
- **Screenshots**: Saves page screenshots for debugging
- **Data Freshness**: Run periodically to keep mappings updated

## 🔍 Troubleshooting

### Common Issues:
1. **No subcategories found**: Try running category scraper first
2. **Empty results**: Check internet connection and try again
3. **MongoDB errors**: Ensure MongoDB is running or disable DB integration

### Debug Mode:
To see browser actions, modify `subcategoryScraper.js`:
```javascript
headless: false  // Set to false to see browser
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test with real Flipkart data
4. Submit pull request

## 📄 License

This project is for educational purposes. Please respect Flipkart's terms of service and robots.txt when using this scraper.