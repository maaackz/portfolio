import React from 'react';

export default function CategoryFilter({ categories, activeCategory, onCategoryChange, counts }) {
  return (
    <div className="category-filter">
      <div className="filter-buttons">
        <button
          className={`filter-button ${activeCategory === 'all' ? 'active' : ''} ${counts?.all === 0 ? 'disabled' : ''}`}
          onClick={() => onCategoryChange('all')}
          disabled={counts?.all === 0}
          style={{ textTransform: 'none' }}
        >
          <span className="filter-text">{`all.`.toLowerCase()} ({counts?.all || 0})</span>
        </button>
        {/* Sort categories: nonzero first, then zero-count to the right */}
        {categories
          .slice()
          .sort((a, b) => {
            const countA = counts?.[a.id] || 0;
            const countB = counts?.[b.id] || 0;
            if (countA === 0 && countB !== 0) return 1;
            if (countA !== 0 && countB === 0) return -1;
            return 0;
          })
          .map(category => (
            <button
              key={category.id}
              className={`filter-button${activeCategory === category.id ? ' active' : ''}${!counts?.[category.id] ? ' disabled' : ''}`}
              onClick={() => onCategoryChange(category.id)}
              disabled={!counts?.[category.id]}
              style={{ textTransform: 'none' }}
            >
              <span className="filter-text">{category.title.toLowerCase()}. ({counts?.[category.id] || 0})</span>
            </button>
          ))}
      </div>
    </div>
  );
} 