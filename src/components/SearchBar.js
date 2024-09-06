import React from 'react';

function SearchBar({ onSearch }) {
  const handleSearch = (event) => {
    onSearch(event.target.value);
  };

  return (
    <input
      type="text"
      placeholder="Search Pokémon"
      className="search-bar"
      onChange={handleSearch}
    />
  );
}

export default SearchBar;
