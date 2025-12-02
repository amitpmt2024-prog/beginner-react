import "../App.css";

interface Movie {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  poster_path: string | null;
}

interface MoviesProps {
  movies: Movie[];
}

const Movies = (props: MoviesProps) => {
    const { movies } = props;
    return ( 
      <div className="MovieList">
        {movies.map((movie: Movie) => {
          return (
            <div className="movie" key={movie.id}>
              <div className="image-container">
                {movie.poster_path ? (
                  <img 
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} 
                    alt={movie.title}
                  />
                ) : (
                  <div>No image available</div>
                )}
              </div>

              <div className="movie-details">
                <h1 className="movie-title">{movie.title}</h1>
                {movie.overview && (
                  <p className="movie-overview">Plot: {movie.overview}</p>
                )}
                {movie.release_date && (
                  <p className="movie-release-data">Release date: {movie.release_date}</p>
                )}
                <p className="movie-rating">Rating: {movie.vote_average}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
}
 
export default Movies;