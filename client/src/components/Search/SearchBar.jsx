import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { setSearchExpanded } from '../../store/uiSlice';
import { weatherService } from '../../services/weatherApi';

const useDebounce = (fn, delay) => {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
};

const SearchBar = ({ onSearch }) => {
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const fetchSuggestions = useCallback(async (q) => {
    if (q.length < 2) { setSuggestions([]); return; }
    setLoading(true);
    try {
      const { data } = await weatherService.searchCities(q);
      setSuggestions(data.data || []);
    } catch (_) { setSuggestions([]); }
    finally { setLoading(false); }
  }, []);

  const debouncedFetch = useDebounce(fetchSuggestions, 350);

  const handleChange = (e) => {
    setQuery(e.target.value);
    debouncedFetch(e.target.value);
  };

  const handleSelect = (city) => {
    const label = `${city.cityName}${city.state ? ', ' + city.state : ''}, ${city.country}`;
    setQuery(label);
    setSuggestions([]);
    onSearch?.({ lat: city.lat, lon: city.lon, cityName: city.cityName });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (suggestions.length > 0) { handleSelect(suggestions[0]); return; }
    onSearch?.({ city: query.trim() });
  };

  return (
    <form onSubmit={handleSubmit} style={{ position: 'relative', width: '100%' }} id="search-form">
      <motion.div
        animate={{ boxShadow: focused ? '0 0 0 3px var(--accent-glow)' : 'none' }}
        transition={{ duration: 0.2 }}
        style={{ borderRadius: 'var(--radius-full)', position: 'relative' }}
      >
        <input
          ref={inputRef}
          className="neo-input"
          id="city-search-input"
          type="text"
          placeholder="🔍  Search city, ZIP, or coordinates..."
          value={query}
          onChange={handleChange}
          onFocus={() => { setFocused(true); dispatch(setSearchExpanded(true)); }}
          onBlur={() => { setTimeout(() => { setFocused(false); dispatch(setSearchExpanded(false)); setSuggestions([]); }, 200); }}
          style={{ width: '100%', borderRadius: 'var(--radius-full)', paddingRight: 48 }}
          autoComplete="off"
        />
        {loading && (
          <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)' }}>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 18, height: 18, border: '2px solid var(--border-subtle)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%' }}
            />
          </div>
        )}
      </motion.div>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {suggestions.length > 0 && focused && (
          <motion.ul
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            id="search-suggestions"
            style={{
              position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 'var(--z-dropdown)',
              background: 'var(--bg-glass-strong)', border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-lg)', backdropFilter: 'blur(20px)',
              boxShadow: 'var(--shadow-lg)', listStyle: 'none', overflow: 'hidden',
            }}
          >
            {suggestions.map((city, i) => (
              <motion.li
                key={`${city.lat}-${city.lon}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleSelect(city)}
                style={{
                  padding: '12px 16px', cursor: 'pointer', display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                  borderBottom: i < suggestions.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-glass)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                  📍 {city.cityName}{city.state ? `, ${city.state}` : ''}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{city.country}</span>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </form>
  );
};

export default SearchBar;
