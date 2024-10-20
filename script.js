const apiKey = 'CH0FS41R6NCU9SM7';  // Replace with your Alpha Vantage API key

// Example list of 10 trending stocks
const trendingStocks = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NFLX', 'NVDA', 'AMD', 'INTC'];

// Initialize chart variable globally
let stockChart;

// Populate dropdown with trending stocks
function populateTrendingStocks() {
    const dropdown = document.getElementById('trending-stocks');
    trendingStocks.forEach(symbol => {
        const option = document.createElement('option');
        option.value = symbol;
        option.textContent = symbol;
        dropdown.appendChild(option);
    });
}

// Function to fetch stock data for a specific symbol
// async function fetchStockData(symbol) {
//     try {
//         const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
//         const data = await response.json();
//         if (!data['Global Quote']) {
//             throw new Error('Invalid stock symbol or API limit reached.');
//         }
//         return data['Global Quote'];
//     } catch (error) {
//         console.error(`Error fetching stock data for ${symbol}:`, error);
//         return null;  // Return null if there's an error
//     }
// }

// // Function to fetch historical data for chart
// async function fetchStockHistory(symbol) {
//     try {
//         const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`);
//         const data = await response.json();
//         if (!data['Time Series (Daily)']) {
//             throw new Error('Error fetching historical data.');
//         }
//         return data['Time Series (Daily)'];
//     } catch (error) {
//         console.error(`Error fetching stock history for ${symbol}:`, error);
//         return null;  // Return null if there's an error
//     }
// }


// Function to delay execution
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Modify fetchStockData and fetchStockHistory to include throttling
async function fetchStockData(symbol) {
    await delay(1200); // Wait for 1.2 seconds to avoid hitting the limit
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`);
        const data = await response.json();
        if (!data['Global Quote']) {
            throw new Error('Invalid stock symbol or API limit reached.');
        }
        return data['Global Quote'];
    } catch (error) {
        console.error(`Error fetching stock data for ${symbol}:`, error);
        return null;  // Return null if there's an error
    }
}

async function fetchStockHistory(symbol) {
    await delay(1200); // Wait for 1.2 seconds to avoid hitting the limit
    try {
        const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`);
        const data = await response.json();
        if (!data['Time Series (Daily)']) {
            throw new Error('Error fetching historical data.');
        }
        return data['Time Series (Daily)'];
    } catch (error) {
        console.error(`Error fetching stock history for ${symbol}:`, error);
        return null;  // Return null if there's an error
    }
}

// Function to update stock details
function updateStockDetails(stockData) {
    if (!stockData) {
        document.getElementById('stock-price').innerText = 'N/A';
        document.getElementById('stock-volume').innerText = 'N/A';
        document.getElementById('stock-change').innerText = 'N/A';
        alert('Failed to fetch stock data. Please try again later or check the stock symbol.');
        return;
    }
    document.getElementById('stock-name').innerText = stockData['01. symbol'] || 'N/A';
    document.getElementById('stock-price').innerText = stockData['05. price'] || 'N/A';
    document.getElementById('stock-volume').innerText = stockData['06. volume'] || 'N/A';
    document.getElementById('stock-change').innerText = stockData['09. change'] || 'N/A';
}

// Function to update chart with historical data
function updateChart(stockHistory, symbol) {
    if (!stockHistory) {
        alert('Failed to fetch stock history.');
        return;
    }

    const labels = Object.keys(stockHistory).reverse();
    const dataPoints = labels.map(date => stockHistory[date]['4. close']);

    const ctx = document.getElementById('stock-chart').getContext('2d');
    
    if (stockChart) {
        stockChart.destroy();  // Destroy previous chart if it exists
    }

    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: `${symbol} Stock Price`,
                data: dataPoints,
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }]
        },
        options: {
            scales: {
                x: { display: true },
                y: { display: true },
            },
        }
    });
}

// Function to add stock data to the comparison table
function updateComparisonTable(stockData) {
    if (!stockData) {
        return;
    }

    const tableBody = document.getElementById('comparison-body');
    const row = document.createElement('tr');

    row.innerHTML = `
        <td>${stockData['01. symbol'] || 'N/A'}</td>
        <td>${stockData['05. price'] || 'N/A'}</td>
        <td>${stockData['09. change'] || 'N/A'}</td>
        <td>${stockData['06. volume'] || 'N/A'}</td>
    `;

    tableBody.appendChild(row);
}

// Event listener for search button
document.getElementById('search-btn').addEventListener('click', async () => {
    const symbol = document.getElementById('stock-search').value;
    const stockData = await fetchStockData(symbol);
    const stockHistory = await fetchStockHistory(symbol);

    updateStockDetails(stockData);
    updateChart(stockHistory, symbol);
    updateComparisonTable(stockData);
});

// Event listener for dropdown selection
document.getElementById('trending-stocks').addEventListener('change', async (e) => {
    const symbol = e.target.value;
    const stockData = await fetchStockData(symbol);
    const stockHistory = await fetchStockHistory(symbol);

    updateStockDetails(stockData);
    updateChart(stockHistory, symbol);
    updateComparisonTable(stockData);
});

// Populate trending stocks dropdown on page load
populateTrendingStocks();
