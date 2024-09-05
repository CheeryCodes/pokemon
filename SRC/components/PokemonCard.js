import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getPokemonTypeColor } from './PokemonColors';


function PokemonCard({ pokemon }) {
  const navigate = useNavigate();
  const typeColor = getPokemonTypeColor(pokemon.types);

  const handleClick = () => {
    navigate(`/pokemon/${pokemon.id}`); 
  };

  return (
    <div className="pokemon-card" style={{ backgroundColor: typeColor }} onClick={handleClick}>
      <img src={pokemon.sprites.front_default} alt={pokemon.name} className="pokemon-image" />
      <h2>{pokemon.name}</h2>
      <div>
        {pokemon.types.map((type) => (
          <span key={type.type.name} className="pokemon-type">
            {type.type.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default PokemonCard;
