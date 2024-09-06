import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import './Home.css';

const PokemonCard = lazy(() => import('../components/PokemonCard')); // Lazy load PokemonCard
const Loading = lazy(() => import('../components/Loading')); // Lazy load Loading

function Home() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
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

  // Helper function to add a delay
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Fetch paginated Pokémon data based on the current search term and page
  const fetchPokemons = useCallback(async () => {
    setLoading(true); // Start loading spinner

    try {
      let results = [];

      if (searchTerm) {
        // Fetch only filtered Pokémon based on the search term
        const filteredResults = allPokemons.filter(pokemon =>
          pokemon.name.toLowerCase().startsWith(searchTerm)
        );
        
        if (filteredResults.length === 0) {
          setHasMore(false); // No results for this search
          setPokemons([]); // Clear the Pokémon list
          setLoading(false);
          return;
        }

        // Fetch only the filtered Pokémon details with delay
        for (let i = (currentPage - 1) * 20; i < currentPage * 20 && i < filteredResults.length; i++) {
          const pokemon = filteredResults[i];
          const details = await axios.get(pokemon.url);
          results.push(details.data);
          await delay(500); // Add a 500ms delay between each fetch
        }

      } else {
        // Fetch paginated Pokémon when no search term is present
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?offset=${(currentPage - 1) * 20}&limit=20`);
        const pokemonBatch = response.data.results;

        for (let i = 0; i < pokemonBatch.length; i++) {
          const pokemon = pokemonBatch[i];
          const details = await axios.get(pokemon.url);
          results.push(details.data);
          await delay(500); // Add a 500ms delay between each fetch
        }

        setHasMore(response.data.next !== null); // Check if more pages exist
      }

      // Append new results to the list or set search results
      setPokemons(prevPokemons => currentPage === 1 ? results : [...prevPokemons, ...results]); // Reset on page 1 (for search)
      setLoading(false); // Stop loading spinner
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }, [allPokemons, searchTerm, currentPage]);

  // Load more Pokémon when scrolling reaches the bottom (only if no search term)
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 && !loading && !searchTerm) {
        setCurrentPage(prevPage => prevPage + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, searchTerm]);

  useEffect(() => {
    fetchAllPokemons(); // Fetch all Pokémon on component mount
  }, [fetchAllPokemons]);

  useEffect(() => {
    fetchPokemons(); // Fetch Pokémon for the current page or search
  }, [fetchPokemons, currentPage, searchTerm]);

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
      <Suspense fallback={<div>Loading...</div>}>
        {loading && <Loading />}
        <div className="pokemon-grid">
          {pokemons.length > 0 ? (
            pokemons.map(pokemon => (
              <PokemonCard key={pokemon.name} pokemon={pokemon} />
            ))
          ) : (
            !loading && <p>No Pokémon found. Please check the name and try again.</p>
          )}
        </div>
        {loading && <Loading />}
      </Suspense>
    </div>
  );
}

export default Home;
