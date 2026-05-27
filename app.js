const express = require('express');
const dotenv=require('dotenv');
const connectDb = require('./app/config/db');
const bodyParser=require('body-parser')
const authRoutes = require('./app/router/authRoutes');
const adminRoutes = require('./app/router/adminRoutes');
const bookingRoutes = require('./app/router/bookingRoutes');
const reportRoutes=require('./app/router/reportRoutes')
const path=require('path')
dotenv.config()
const app=express();
connectDb();



// ======body parser=========
app.use(express.json({
    limit:"50mb",
    extended:true
}));
app.use(express.urlencoded({extended:true}))

// ========== static ===========
app.use(express.static('public'));
app.use('uploads',express.static(path.join(__dirname,'/uploads')))
app.use('/uploads',express.static('uploads'))


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reports', reportRoutes);





const port=5002;
app.listen(port,()=>{
    console.log(`server is running on port ${port}`);   
})