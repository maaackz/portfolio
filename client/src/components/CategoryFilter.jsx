import React from 'react';

export default function CategoryFilter({ categories, activeCategory, onCategoryChange, counts }) {
  return (
    <div className="category-filter">
      <div className="filter-buttons">
        <button 
          className={`filter-button ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => onCategoryChange('all')}
        >
          <span className="filter-text">all ({counts?.all || 0})</span>
        </button>
        {categories.map(category => (
          <button 
            key={category.id}
            className={`filter-button ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => onCategoryChange(category.id)}
          >
            <span className="filter-text">{category.title.toLowerCase()} ({counts?.[category.id] || 0})</span>
          </button>
        ))}
      </div>
    </div>
  );
} 