const express=require('express')
const bodyParser=require('body-parser')
const salesRoutes=require('./routes/sales')

const app = express();

app.use(bodyParser.json());

// Routes
app.use('/api', salesRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});