import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import './PokemonDetail.css';
import { getPokemonTypeColor } from '../components/PokemonColors';

function PokemonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${id}/`);
        setPokemon(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };

    fetchPokemon();
  }, [id]);
  const handleBackClick = () => {
    navigate('/'); // Navigate to home page
  };
  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentTab((prev) => (prev + 1) % 3),
    onSwipedRight: () => setCurrentTab((prev) => (prev - 1 + 3) % 3),
  });

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!pokemon) {
    return <p>Pokemon not found</p>;
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 0:
        return (
          <div className="tab-content">
            <h3>Basic Info</h3>
            <p>Height: {pokemon.height / 10} m</p>
            <p>Weight: {pokemon.weight / 10} kg</p>
            <p>Base Experience: {pokemon.base_experience}</p>
            <p>Abilities:
            {pokemon.abilities.map((ability) => (
              <span key={ability.ability.name}> {ability.ability.name} | </span>
            ))}
            </p>
          </div>
        );
      case 1:
        return (
            <div className="tab-content">
              <h3>Base Stats</h3>
              {pokemon.stats.map((stat) => (
                <p key={stat.stat.name}>
                  {stat.stat.name.replace('-', ' ')}: {stat.base_stat}
                </p>
              ))}
            </div>
          );
      case 2:
        return (
          <div className="tab-content">
            <h3>Moves</h3>
            {pokemon.moves && pokemon.moves.length > 0 ? (
            pokemon.moves.slice(0, 5).map((move) => (
              <div key={move.move.name} className="move-item">
                  <ul> <li>{move.move.name}</li></ul>
              </div>
            ))
          ) : (
            <p>No moves found</p>
          )}
          </div>
        );
      default:
        return null;
    }
  };

  const typeColor = getPokemonTypeColor(pokemon.types);

  return (
      
    <div className="pokemon-detail" {...handlers}>
      <div className="pokemon-header" style={{ backgroundColor: typeColor }}>
      <button onClick={handleBackClick} className="back-button">Back to Home</button>
        <h1>{pokemon.name}</h1>
        <img src={pokemon.sprites.front_default} alt={pokemon.name} className="pokemon-detail-image" />
        <div className="pokemon-types">
          {pokemon.types.map((type) => (
            <span key={type.type.name} className={`pokemon-type ${type.type.name}`}>
              {type.type.name}
            </span>
          ))}
        </div>
      </div>
      <div className="tab-headings">
        <span
          className={`tab-heading ${currentTab === 0 ? 'active' : ''}`}
          onClick={() => setCurrentTab(0)}
        >
          Basic Info
        </span>
        <span
          className={`tab-heading ${currentTab === 1 ? 'active' : ''}`}
          onClick={() => setCurrentTab(1)}
        >
          Base Stats
        </span>
        <span
          className={`tab-heading ${currentTab === 2 ? 'active' : ''}`}
          onClick={() => setCurrentTab(2)}
        >
          Moves
        </span>
      </div>
      <div className="tab-container">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default PokemonDetail;
