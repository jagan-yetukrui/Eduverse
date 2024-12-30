import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaHeart, FaFolder, FaSearch, FaTimes } from 'react-icons/fa';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const SavedItems = () => {
  const [savedItems, setSavedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSavedItems = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          'http://127.0.0.1:8000/api/saved-items',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSavedItems(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching saved items:', err);
        setError('Failed to load saved items. Please try again.');
        setLoading(false);
      }
    };

    fetchSavedItems();
  }, []);

  const handleUnsave = async (itemId, itemType) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(
        `http://127.0.0.1:8000/api/saved-items/${itemId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSavedItems(savedItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing saved item:', err);
      setError('Failed to remove item. Please try again.');
    }
  };

  const filteredItems = savedItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="saved-items-container">
      <div className="saved-items-header">
        <h2>Saved Items</h2>
        <div className="saved-items-controls">
          <div className="category-filters">
            <button
              className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All
            </button>
            <button
              className={`category-btn ${activeCategory === 'post' ? 'active' : ''}`}
              onClick={() => setActiveCategory('post')}
            >
              Posts
            </button>
            <button
              className={`category-btn ${activeCategory === 'project' ? 'active' : ''}`}
              onClick={() => setActiveCategory('project')}
            >
              Projects
            </button>
          </div>
          <div className="search-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search saved items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </div>

      {filteredItems.length === 0 ? (
        <p className="no-items">No saved items found</p>
      ) : (
        <div className="saved-items-grid">
          {filteredItems.map(item => (
            <div key={item.id} className="saved-item-card">
              <div className="item-header">
                <FaFolder className={`item-type-icon ${item.type}`} />
                <button
                  className="unsave-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleUnsave(item.id, item.type);
                  }}
                >
                  <FaTimes />
                </button>
              </div>
              <div 
                className="item-content"
                onClick={() => navigate(`/${item.type}s/${item.id}`)}
              >
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="item-meta">
                  <span className="save-date">
                    Saved on {format(new Date(item.saved_at), 'MMM d, yyyy')}
                  </span>
                  {item.type === 'post' && (
                    <span className="likes">
                      <FaHeart /> {item.likes}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedItems;
