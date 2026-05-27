const Movie = require('../models/movieModel');
const Theater = require('../models/theaterModel');

class movieController{
  async addMovie (req, res){
  try {
    const movie = await Movie.create(req.body);
    const theater = await Theater.create(req.body);
    res.status(201).json({data:movie,theater:theater._id});
  } catch (err) {
    res.status(500).json({ message: 'Failed to add movie', error: err.message });
  }
};

async editMovie (req, res){
  try {
    const id = req.params.id;
      const { name,genre,language,duration,cast,director,releaseDate,assignedTheaters} = req.body;
      const data = await Movie.findByIdAndUpdate(id, {
        name,genre,language,duration,cast,director,releaseDate,assignedTheaters
      });
    res.status(200).json({message:"updated successfully",data:data});
  } catch (err) {
    res.status(500).json({ message: 'Failed to update movie', error: err.message });
  }
};

async deleteMovie(req, res){
  try {
    await Movie.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Movie deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete movie', error: err.message });
  }
};

async listMovies(req, res) {
  try {
    const movies = await Movie.aggregate([
      {
        $lookup: {
          from: 'theaters', // MongoDB collection name
          localField: 'assignedTheaters.theater',
          foreignField: '_id',
          as: 'theaterDetails'
        }
      },
      {
        $addFields: {
          totalTheaters: { $size: '$assignedTheaters' }
        }
      }
    ]);

    res.status(200).json({ total: movies.length, data: movies });
  } catch (err) {
    res.status(500).json({ message: 'Failed to list movies', error: err.message });
  }
}

async assignMovieToTheater(req, res) {
  try {
    const { movieId, theaterId, screenNumber, showTimings } = req.body;
    const movie = await Movie.findById(movieId);
    movie.assignedTheaters.push({ theater: theaterId, screenNumber, showTimings });
    await movie.save();
    res.status(200).json({ message: 'Movie assigned to theater' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to assign movie', error: err.message });
  }
};

}
module.exports=new movieController()