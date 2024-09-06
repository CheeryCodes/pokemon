import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import './Home.css';

const PokemonCard = lazy(() => import('../components/PokemonCard')); // Lazy load PokemonCard

function Home() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true); // For data loading
  const [searchTerm, setSearchTerm] = useState('');
  const [allPokemons, setAllPokemons] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true); // For infinite scroll

  // Fetch all Pokémon names and URLs on component mount
  const fetchAllPokemons = useCallback(async () => {
    try {
      let allPokemonResults = [];
      let url = 'https://pokeapi.co/api/v2/pokemon?limit=1500';
      while (url) {
        const response = await axios.get(url);
        allPokemonResults = [...allPokemonResults, ...response.data.results];
        url = response.data.next; // Check if there's a next page
      }
      setAllPokemons(allPokemonResults);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }, []);

  // Fetch paginated Pokémon data based on the current search term and page
  const fetchPokemons = useCallback(async () => {
    if (!hasMore || loading) return; // Prevent fetching if there's no more data or currently loading
    setLoading(true);
    try {
      let results = [];
      if (searchTerm) {
        const filteredResults = allPokemons.filter(pokemon =>
          pokemon.name.toLowerCase().startsWith(searchTerm)
        );
        if (filteredResults.length === 0) {
          setHasMore(false);
          setLoading(false);
          return;
        }
        const promises = filteredResults.slice((currentPage - 1) * 20, currentPage * 20).map(async (pokemon) => {
          const details = await axios.get(pokemon.url);
          return details.data;
        });
        results = await Promise.all(promises);
      } else {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?offset=${(currentPage - 1) * 20}&limit=20`);
        const promises = response.data.results.map(async (pokemon) => {
          const details = await axios.get(pokemon.url);
          return details.data;
        });
        results = await Promise.all(promises);
        setHasMore(response.data.next !== null); // Check if more pages exist
      }
      setPokemons(prevPokemons => [...prevPokemons, ...results]); // Append new results to the list
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [allPokemons, searchTerm, currentPage, hasMore, loading]);

  // Load more Pokémon when scrolling reaches the bottom
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading]);

  useEffect(() => {
    fetchAllPokemons(); // Fetch all Pokémon on component mount
  }, [fetchAllPokemons]);

  useEffect(() => {
    fetchPokemons(); // Fetch Pokémon for the current page
  }, [fetchPokemons, currentPage]);

  const handleSearch = (term) => {
    setSearchTerm(term.toLowerCase()); // Update search term
    setCurrentPage(1); // Reset to the first page after search
    setPokemons([]); // Clear existing Pokémon list
    setHasMore(true); // Reset infinite scroll
  };

  return (
    <div>
      <h1 className="page-heading">Pokémon List</h1>
      <SearchBar onSearch={handleSearch} />
      {/* Only wrap lazy-loaded components in Suspense */}
      <div className="pokemon-grid">
        {pokemons.length > 0 ? (
          <Suspense fallback={<div>Loading Pokémon Cards...</div>}>
            {pokemons.map(pokemon => (
              <PokemonCard key={pokemon.name} pokemon={pokemon} />
            ))}
          </Suspense>
        ) : (
          !loading && <p>No Pokémon found. Please check the name and try again.</p>
        )}
      </div>
      {loading && <p>Loading more Pokémon...</p>} {/* Handle data loading here */}
    </div>
  );
}

export default Home;
