// DealFinder App
const API_BASE = '/api';

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const retryBtn = document.getElementById('retryBtn');

const dealsSection = document.querySelector('.deals-section');
const searchResultsSection = document.getElementById('searchResults');
const dealsGrid = document.getElementById('dealsGrid');
const searchResultsGrid = document.getElementById('searchResultsGrid');

const loadingState = document.getElementById('loadingState');
const emptyState = document.getElementById('emptyState');
const errorState = document.getElementById('errorState');
const errorDetails = document.getElementById('errorDetails');

const searchLoadingState = document.getElementById('searchLoadingState');
const searchEmptyState = document.getElementById('searchEmptyState');
const searchErrorState = document.getElementById('searchErrorState');
const searchErrorDetails = document.getElementById('searchErrorDetails');

// State
let currentMode = 'deals'; // 'deals' or 'search'
let currentDeals = [];
let currentSearchResults = { deals: [], products: [] };

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadDeals();
});

// Setup Event Listeners
function setupEventListeners() {
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
  refreshBtn.addEventListener('click', loadDeals);
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    switchToDealsMode();
    loadDeals();
  });
  retryBtn.addEventListener('click', loadDeals);
}

// Load Deals
async function loadDeals() {
  showLoadingState('deals');
  try {
    const response = await fetch(`${API_BASE}/deals`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    currentDeals = data.deals || [];
    
    if (currentDeals.length === 0) {
      showEmptyState('deals');
    } else {
      renderDeals(currentDeals, 'deals');
    }
  } catch (error) {
    console.error('Failed to load deals:', error);
    showErrorState('deals', error.message);
  }
}

// Perform Search
async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    alert('Please enter a search term');
    return;
  }

  switchToSearchMode();
  showLoadingState('search');

  try {
    const response = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    currentSearchResults = data;
    
    const totalResults = (data.deals || []).length + (data.products || []).length;
    if (totalResults === 0) {
      showEmptyState('search');
    } else {
      renderSearchResults(data);
    }
  } catch (error) {
    console.error('Search failed:', error);
    showErrorState('search', error.message);
  }
}

// Render Deals
function renderDeals(deals, mode = 'deals') {
  const grid = mode === 'deals' ? dealsGrid : searchResultsGrid;
  grid.innerHTML = '';

  deals.forEach((deal) => {
    const card = createDealCard(deal);
    grid.appendChild(card);
  });

  hideAllStates(mode);
}

// Render Search Results
function renderSearchResults(results) {
  searchResultsGrid.innerHTML = '';

  // Render deals
  if (results.deals && results.deals.length > 0) {
    results.deals.forEach((deal) => {
      const card = createDealCard(deal);
      searchResultsGrid.appendChild(card);
    });
  }

  // Render products
  if (results.products && results.products.length > 0) {
    results.products.forEach((product) => {
      const card = createProductCard(product);
      searchResultsGrid.appendChild(card);
    });
  }

  hideAllStates('search');
}

// Create Deal Card
function createDealCard(deal) {
  const card = document.createElement('div');
  card.className = 'deal-card';

  const discountPercent = deal.discount_percentage
    ? `${Math.round(deal.discount_percentage)}% OFF`
    : null;

  let pricingHTML = '';
  if (deal.deal_price) {
    pricingHTML = `
      <div class="deal-pricing">
        ${deal.original_price ? `<div class="deal-original-price">\$${parseFloat(deal.original_price).toFixed(2)}</div>` : ''}
        <div class="deal-price">\$${parseFloat(deal.deal_price).toFixed(2)}</div>
        ${discountPercent ? `<div class="deal-discount">${discountPercent}</div>` : ''}
      </div>
    `;
  }

  card.innerHTML = `
    <div class="deal-card-header">
      <div class="deal-title">${escapeHtml(deal.title)}</div>
      ${deal.source ? `<div class="deal-source">${escapeHtml(deal.source)}</div>` : ''}
    </div>
    <div class="deal-card-body">
      ${deal.description ? `<div class="deal-description">${escapeHtml(deal.description)}</div>` : ''}
      ${pricingHTML}
      <div class="deal-meta">
        ${deal.active === 1 ? '<span class="deal-badge">Active</span>' : '<span class="deal-badge">Inactive</span>'}
      </div>
    </div>
  `;

  return card;
}

// Create Product Card
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'deal-card';

  card.innerHTML = `
    <div class="deal-card-header">
      <div class="deal-title">${escapeHtml(product.name)}</div>
      ${product.category ? `<div class="deal-source">${escapeHtml(product.category)}</div>` : ''}
    </div>
    <div class="deal-card-body">
      ${product.description ? `<div class="deal-description">${escapeHtml(product.description)}</div>` : ''}
      ${product.price ? `<div class="deal-price">\$${parseFloat(product.price).toFixed(2)}</div>` : ''}
      <div class="deal-meta">
        <span class="deal-badge">Product</span>
      </div>
    </div>
  `;

  return card;
}

// Show/Hide States
function showLoadingState(mode) {
  if (mode === 'deals') {
    loadingState.style.display = 'flex';
    emptyState.style.display = 'none';
    errorState.style.display = 'none';
    dealsGrid.innerHTML = '';
  } else {
    searchLoadingState.style.display = 'flex';
    searchEmptyState.style.display = 'none';
    searchErrorState.style.display = 'none';
    searchResultsGrid.innerHTML = '';
  }
}

function showEmptyState(mode) {
  if (mode === 'deals') {
    loadingState.style.display = 'none';
    emptyState.style.display = 'flex';
    errorState.style.display = 'none';
    dealsGrid.innerHTML = '';
  } else {
    searchLoadingState.style.display = 'none';
    searchEmptyState.style.display = 'flex';
    searchErrorState.style.display = 'none';
    searchResultsGrid.innerHTML = '';
  }
}

function showErrorState(mode, message) {
  if (mode === 'deals') {
    loadingState.style.display = 'none';
    emptyState.style.display = 'none';
    errorState.style.display = 'flex';
    errorDetails.textContent = message || 'Please try again later.';
    dealsGrid.innerHTML = '';
  } else {
    searchLoadingState.style.display = 'none';
    searchEmptyState.style.display = 'none';
    searchErrorState.style.display = 'flex';
    searchErrorDetails.textContent = message || 'Please try again later.';
    searchResultsGrid.innerHTML = '';
  }
}

function hideAllStates(mode) {
  if (mode === 'deals') {
    loadingState.style.display = 'none';
    emptyState.style.display = 'none';
    errorState.style.display = 'none';
  } else {
    searchLoadingState.style.display = 'none';
    searchEmptyState.style.display = 'none';
    searchErrorState.style.display = 'none';
  }
}

// Switch Modes
function switchToDealsMode() {
  currentMode = 'deals';
  dealsSection.style.display = 'block';
  searchResultsSection.style.display = 'none';
}

function switchToSearchMode() {
  currentMode = 'search';
  dealsSection.style.display = 'none';
  searchResultsSection.style.display = 'block';
}

// Utility Functions
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
