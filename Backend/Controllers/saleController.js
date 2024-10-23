const fs=require('fs')
const axios=require('axios')
const dataFilepath='../data/products.json'

exports.initializeDatabase = async (req, res) =>{
  try{
const response= await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
const data=response.data
console.log(data)

fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
res.json({ message: 'Database initialized with seed data' });
  }  
  catch (error) {
    res.status(500).json({ message: 'Error initializing database', error });
}
}

exports.getTransactions = (req, res)=>{
    const { month, search, page = 1, per_page = 10 } = req.query;
    const data=SON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    let filteredData = data.filter(product => new Date(product.dateOfSale).toLocaleString('en-us', { month: 'long' }).toLowerCase() === month.toLowerCase());

    if (search) {
        filteredData = filteredData.filter(product =>
            product.title.toLowerCase().includes(search.toLowerCase()) ||
            product.description.toLowerCase().includes(search.toLowerCase()) ||
            product.price === parseFloat(search)
        );
    }

    const startIndex = (page - 1) * per_page;
    const paginatedData = filteredData.slice(startIndex, startIndex + per_page);

    res.json(paginatedData);
}

exports.getStatistics = (req, res) => {
    const { month } = req.query;
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    const filteredData = data.filter(product => new Date(product.dateOfSale).toLocaleString('en-us', { month: 'long' }).toLowerCase() === month.toLowerCase());

    const totalSoldItems = filteredData.filter(item => item.dateOfSale).length;
    const totalNotSoldItems = filteredData.length - totalSoldItems;
    const totalSalesAmount = filteredData.reduce((total, item) => total + item.price, 0);

    res.json({
        totalSalesAmount,
        totalSoldItems,
        totalNotSoldItems
    });
};

exports.getBarChart = (req, res) => {
    const { month } = req.query;
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    const filteredData = data.filter(product => new Date(product.dateOfSale).toLocaleString('en-us', { month: 'long' }).toLowerCase() === month.toLowerCase());

    const priceRanges = {
        '0-100': 0, '101-200': 0, '201-300': 0, '301-400': 0, '401-500': 0,
        '501-600': 0, '601-700': 0, '701-800': 0, '801-900': 0, '901-above': 0
    };

    filteredData.forEach(item => {
        if (item.price >= 0 && item.price <= 100) priceRanges['0-100']++;
        else if (item.price >= 101 && item.price <= 200) priceRanges['101-200']++;
        else if (item.price >= 201 && item.price <= 300) priceRanges['201-300']++;
        else priceRanges['901-above']++;
    });

    res.json(priceRanges);
};

exports.getPieChart = (req, res) => {
    const { month } = req.query;
    const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
    const filteredData = data.filter(product => new Date(product.dateOfSale).toLocaleString('en-us', { month: 'long' }).toLowerCase() === month.toLowerCase());

    const categoryCounts = filteredData.reduce((counts, item) => {
        counts[item.category] = (counts[item.category] || 0) + 1;
        return counts;
    }, {});

    res.json(categoryCounts);
};

exports.getCombinedData = async (req, res) => {
    try {
        const transactions = await exports.getTransactions(req, res);
        const statistics = await exports.getStatistics(req, res);
        const barChart = await exports.getBarChart(req, res);
        const pieChart = await exports.getPieChart(req, res);

        res.json({
            transactions,
            statistics,
            barChart,
            pieChart
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching combined data', error });
    }
};