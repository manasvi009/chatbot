import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './AdminFaqManagement.css';

interface Faq {
  _id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  createdBy: any;
  updatedBy?: any;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  aiConfidenceScore: number;
  usageCount: number;
}

const AdminFaqManagement: React.FC = () => {
  const { token } = useAuth();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  
  // Form state
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [aiConfidenceScore, setAiConfidenceScore] = useState(0.8);

  // Fetch FAQs
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const response = await fetch('/api/admin/faqs', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setFaqs(data);
        } else {
          setError('Failed to fetch FAQs');
        }
      } catch (err) {
        setError('Error fetching FAQs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();
  }, [token]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const faqData = {
      question,
      answer,
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isActive,
      aiConfidenceScore
    };

    try {
      let response;
      if (editingFaq) {
        // Update existing FAQ
        response = await fetch(`/api/admin/faqs/${editingFaq._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(faqData)
        });
      } else {
        // Create new FAQ
        response = await fetch('/api/admin/faqs', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(faqData)
        });
      }

      if (response.ok) {
        const newFaq = await response.json();
        
        if (editingFaq) {
          // Update the FAQ in the list
          setFaqs(faqs.map(faq => faq._id === newFaq._id ? newFaq : faq));
        } else {
          // Add new FAQ to the list
          setFaqs([newFaq, ...faqs]);
        }
        
        // Reset form
        resetForm();
      } else {
        setError('Failed to save FAQ');
      }
    } catch (err) {
      setError('Error saving FAQ');
      console.error(err);
    }
  };

  // Handle editing an FAQ
  const handleEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category);
    setTags(faq.tags.join(', '));
    setIsActive(faq.isActive);
    setAiConfidenceScore(faq.aiConfidenceScore);
    setShowForm(true);
  };

  // Handle deleting an FAQ
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      const response = await fetch(`/api/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Remove the FAQ from the list
        setFaqs(faqs.filter(faq => faq._id !== id));
      } else {
        setError('Failed to delete FAQ');
      }
    } catch (err) {
      setError('Error deleting FAQ');
      console.error(err);
    }
  };

  // Reset form
  const resetForm = () => {
    setQuestion('');
    setAnswer('');
    setCategory('');
    setTags('');
    setIsActive(true);
    setAiConfidenceScore(0.8);
    setEditingFaq(null);
    setShowForm(false);
  };

  if (loading) return <div className="admin-faq-loading">Loading FAQs...</div>;
  if (error) return <div className="admin-faq-error">{error}</div>;

  return (
    <div className="admin-faq-management">
      <div className="faq-header">
        <h2>FAQ Management</h2>
        <button 
          className="add-faq-btn"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          {showForm && !editingFaq ? 'Cancel' : 'Add New FAQ'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="faq-form">
          <h3>{editingFaq ? 'Edit FAQ' : 'Add New FAQ'}</h3>
          
          <div className="form-group">
            <label htmlFor="question">Question:</label>
            <input
              type="text"
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="answer">Answer:</label>
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              rows={4}
            ></textarea>
          </div>
          
          <div className="form-group">
            <label htmlFor="category">Category:</label>
            <input
              type="text"
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated):</label>
            <input
              type="text"
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., billing, account, login"
            />
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
              Active
            </label>
          </div>
          
          <div className="form-group">
            <label htmlFor="aiConfidenceScore">AI Confidence Score (0-1):</label>
            <input
              type="number"
              id="aiConfidenceScore"
              value={aiConfidenceScore}
              onChange={(e) => setAiConfidenceScore(parseFloat(e.target.value))}
              min="0"
              max="1"
              step="0.1"
              required
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="save-btn">
              {editingFaq ? 'Update FAQ' : 'Save FAQ'}
            </button>
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="faqs-list">
        <h3>All FAQs</h3>
        {faqs.length === 0 ? (
          <p>No FAQs available</p>
        ) : (
          <div className="faqs-grid">
            {faqs.map(faq => (
              <div key={faq._id} className="faq-item">
                <div className="faq-content">
                  <h4>{faq.question}</h4>
                  <p>{faq.answer.substring(0, 100)}{faq.answer.length > 100 ? '...' : ''}</p>
                  <div className="faq-meta">
                    <span className={`status ${faq.isActive ? 'active' : 'inactive'}`}>
                      {faq.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span>Category: {faq.category}</span>
                    <span>Confidence: {faq.aiConfidenceScore}</span>
                    <span>Used: {faq.usageCount} times</span>
                  </div>
                </div>
                <div className="faq-actions">
                  <button onClick={() => handleEdit(faq)}>Edit</button>
                  <button onClick={() => handleDelete(faq._id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFaqManagement;