const Theater = require('../models/theaterModel');

class theaterController{
  async addTheater (req, res){
  try {
    const theater = await Theater.create(req.body);
    res.status(201).json(theater);
  } catch (err) {
    res.status(500).json({ message: 'Failed to add theater', error: err.message });
  }
};

}
module.exports=new theaterController()