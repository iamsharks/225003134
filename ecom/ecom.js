const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 9876;

const companies = ["AMZ", "FLP", "SNP", "MYN", "AZO"];
const categories = ["Phone", "Computer", "TV", "Earphone", "Tablet", "Charger", "Mouse", "Keypad", "Bluetooth", "Pendrive", "Remote", "Speaker", "Headset", "Laptop", "PC"];

// Function to fetch products from the test server
const fetchProducts = async (company, category, top, minPrice, maxPrice) => {
  const url = 'http://20.244.56.144/test/companies/${company}/categories/${category}/products?top=${top}&minPrice=${minPrice}&maxPrice=${maxPrice}';
  try {
    const res = await axios.get(url, { timeout: 500 });
    return res.data;
  } catch (err) {
    console.error('Error fetching products:', err.message);
    return [];
  }
};

// Function to generate unique IDs for products
const gen_UniqueId = (product) => {
  return uuidv4();
};

// Custom sorting function
const cus_Sort = (a, k, o = 'asc') => {
  for (let i = 0; i < a.length - 1; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      if ((o === 'asc' && a[j][k] > a[j + 1][k]) || (o === 'desc' && a[j][k] < a[j + 1][k])) {
        let tem = a[j];
        a[j] = a[j + 1];
        a[j + 1] = tem;
      }
    }
  }
  return a;
};

// Endpoint to get top N products
app.get('/categories/:categoryname/products', async (req, res) => {
  const cat = req.params.categoryname;
  const top = parseInt(req.query.top) || 10;
  const page = parseInt(req.query.page) || 1;
  const min_Price = parseInt(req.query.minPrice) || 0;
  const max_Price = parseInt(req.query.maxPrice) || Infinity;
  const sort_Key = req.query.sortKey || 'price';
  const sort_Order = req.query.sortOrder || 'asc';

  if (!categories.includes(cat)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  let allProducts = [];
  for (const company of companies) {
    const products = await fetchProducts(company, category, top, min_Price, max_Price);
    allProducts = allProducts.concat(products.map(product => ({ ...product, id: gen_UniqueId(product), company })));
  }

  // Sorting
  allProducts = cus_Sort(allProducts, sort_Key, sort_Order);

  // Pagination
  const startIndex = (page - 1) * top;
  const endIndex = Math.min(startIndex + top, allProducts.length);
  const paginatedProducts = allProducts.slice(startIndex, endIndex);

  res.json(paginatedProducts);
});

// Endpoint to get details of a specific product
app.get('/categories/:categoryname/products/:productid', async (req, res) => {
  const category = req.params.categoryname;
  const productId = req.params.productid;

  if (!categories.includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  let productDetails = null;
  for (const company of companies) {
    const products = await fetchProducts(company, category, 100, 0, Infinity); // Fetch more products to ensure we find the specific one
    const product = products.find(product => product.id === productId);
    if (product) {
      productDetails = { ...product, company };
      break;
    }
  }

  if (!productDetails) {
    return res.status(404).json({ error: 'Product not found' });
  }

  res.json(productDetails);
});

app.listen(port, () => {
  console.log('Server running at http://localhost:9876');
});
