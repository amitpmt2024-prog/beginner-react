import { useState } from "react";
import type { ChangeEvent } from "react";
import DefaultList from "./DefaultList";
import Movies from "./Movies";

interface Movie {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    vote_average: number;
    poster_path: string | null;
}

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [movies, setMovie] = useState<Movie[]>([]);
    const [error, setError] = useState<string>("");

    const searchMovie = async (query: string) => {
        try {
            const API_KEY = import.meta.env.VITE_MOVIE_API_KEY || "";
            const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${query}`);
            if (response?.ok) {
                const data = await response.json();
                setMovie(data.results || []);
                setError("");
            } else {
                setError("Error while fetching movies");
                setMovie([]);
            }
        } catch {
            setError("Error while fetching movies");
            setMovie([]);
        }
    }
    
    function handleSearch(event: ChangeEvent<HTMLInputElement>): void {
        const query = event.target.value;
        setSearchQuery(query);
        if(query.trim() !== "") {
            searchMovie(query);
        } else {
            setMovie([]);
            setError("");
        }
    }
    
    return (
        <div>
            <form action="" className="form">
                <h1>Movie</h1>
                <input
                    type="text"
                    placeholder="Search"
                    onChange={handleSearch}
                    value={searchQuery}
                    className="search-input"
                />
            </form>
            {error && <p>{error}</p>}
            {searchQuery ? <Movies movies={movies} /> : <DefaultList />}
        </div>
    );
}

export default SearchBar;