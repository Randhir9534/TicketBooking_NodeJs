const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const movieController = require('../controller/movieController');
const theaterController = require('../controller/theaterController');

router.use( protect,authorizeRoles('Admin'));

router.post('/add/movies', movieController.addMovie);
router.put('/movies/edit/:id', movieController.editMovie);
router.delete('/movies/delete/:id', movieController.deleteMovie);
router.get('/movies', movieController.listMovies);
router.post('/assign-movie', movieController.assignMovieToTheater);

router.post('/theaters', theaterController.addTheater);

module.exports = router;