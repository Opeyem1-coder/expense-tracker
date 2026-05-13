// =====================================================
// src/components/TransactionForm.jsx
// =====================================================
// Modal form to add a new income or expense transaction.
// Supports receipt OCR to auto-fill transaction details.

import { useState } from 'react';
import api from '../api/axios';
import Tesseract from 'tesseract.js';

const CATEGORIES = [
  'Food', 'Transport', 'Housing', 'Entertainment',
  'Health', 'Salary', 'Business', 'Education', 'Shopping', 'Other',
];

const today = new Date().toISOString().split('T')[0]; // "2025-01-15"

// Map transaction types to categories
const TRANSACTION_TYPE_MAP = {
  // Utilities & Services
  'airtime': 'Shopping',
  'data': 'Shopping',
  'electricity': 'Housing',
  'power': 'Housing',
  'water': 'Housing',
  'internet': 'Housing',
  'phone bill': 'Shopping',
  'cable': 'Entertainment',
  'subscription': 'Entertainment',
  'membership': 'Entertainment',
  
  // Transfers & Payments
  'transfer': 'Other',
  'payment': 'Other',
  'bill': 'Housing',
  'charge': 'Shopping',
  
  // Food & Groceries
  'food': 'Food',
  'restaurant': 'Food',
  'grocery': 'Food',
  'supermarket': 'Food',
  'shopping': 'Shopping',
  'mall': 'Shopping',
  'shop': 'Shopping',
  'store': 'Shopping',
  
  // Transport
  'transport': 'Transport',
  'ride': 'Transport',
  'taxi': 'Transport',
  'uber': 'Transport',
  'bolt': 'Transport',
  'bus': 'Transport',
  'fuel': 'Transport',
  'gas': 'Transport',
  'petrol': 'Transport',
  
  // Health
  'health': 'Health',
  'pharmacy': 'Health',
  'hospital': 'Health',
  'medical': 'Health',
  'clinic': 'Health',
  
  // Entertainment
  'movie': 'Entertainment',
  'cinema': 'Entertainment',
  'game': 'Entertainment',
  'gaming': 'Entertainment',
  
  // Education
  'school': 'Education',
  'education': 'Education',
  'course': 'Education',
  'tuition': 'Education',
};

// Extract transaction details from receipt text
const extractTransactionDetails = (text) => {
  const details = {
    amount: '',
    note: '',
    category: '',
  };

  const lowerText = text.toLowerCase();

  // Extract amount - MANY flexible patterns
  const amountPatterns = [
    /#\s*([\d,]+\.?\d*)/gi,            // #10,000.00
    /₦\s*([\d,]+\.?\d*)/gi,            // ₦750.00
    /naira\s+([\d,]+\.?\d*)/gi,        // naira 750.00
    /amount[\s:]*[#₦]?([\d,]+\.?\d*)/gi, // amount: 750.00
    /total[\s:]*[#₦]?([\d,]+\.?\d*)/gi,  // total: 750.00
    /charge[\s:]*[#₦]?([\d,]+\.?\d*)/gi, // charge: 750.00
    /[#₦]\s*([\d,]+(?:,\d{3})*\.?\d*)/g, // Any # or ₦ followed by number
  ];

  let bestAmount = '';
  let maxAmount = 0;

  // Find the largest amount (usually the main transaction)
  for (const pattern of amountPatterns) {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        const num = parseFloat(match[1].replace(/,/g, ''));
        if (num > maxAmount) {
          maxAmount = num;
          bestAmount = match[1].replace(/,/g, '');
        }
      }
    }
  }

  details.amount = bestAmount;

  // Detect transaction type more intelligently
  const typeIndicators = [
    /receipt/i,
    /transfer/i,
    /payment/i,
    /sender.*details|recipient.*details/i,
    /(?:airtime|data|electricity|water|internet|food|restaurant|transport|health|pharmacy|subscription)/i,
  ];

  // Check for payment/transfer indicators
  if (/sender.*details|recipient.*details|transfer/i.test(text)) {
    details.category = 'Other'; // Transfer/Payment
  } else {
    // Look for other transaction types
    for (const [type, category] of Object.entries(TRANSACTION_TYPE_MAP)) {
      if (lowerText.includes(type.toLowerCase())) {
        details.category = category;
        break;
      }
    }
  }

  // Extract merchant name - look for service provider names
  const merchantPatterns = [
    /^(OPay|GTBank|FirstBank|Zenith|Access|UBA|Airtel|MTN|Glo|9mobile)\b/im,
    /([A-Z][A-Za-z\s&]+(?:Bank|Pay|Service|Ltd|Inc)?)/,
  ];

  let merchantName = '';
  for (const pattern of merchantPatterns) {
    const match = text.match(pattern);
    if (match) {
      merchantName = match[1]?.trim();
      if (merchantName && merchantName.length > 2 && merchantName.length < 50) {
        break;
      }
    }
  }

  // Extract transaction type description
  let transactionDesc = '';
  const typeMatch = text.match(/(?:airtime|data|electricity|transfer|payment|subscription|water|internet|food)/i);
  if (typeMatch) {
    transactionDesc = typeMatch[0].trim();
  }

  // If this looks like a transfer, mark it appropriately
  if (/sender.*details|recipient.*details/i.test(text) && !transactionDesc) {
    transactionDesc = 'Transfer';
  }

  // Build note: "Merchant - Description" or best available
  if (merchantName && transactionDesc) {
    details.note = `${merchantName} - ${transactionDesc}`;
  } else if (merchantName) {
    details.note = merchantName;
  } else if (transactionDesc) {
    details.note = transactionDesc;
  }

  // Limit note length
  if (details.note.length > 100) {
    details.note = details.note.substring(0, 97) + '...';
  }

  console.log('Extracted details:', details);
  console.log('Full text was:', text.substring(0, 300));

  return details;
};

function TransactionForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    type:     'expense',
    amount:   '',
    category: '',
    note:     '',
    date:     today,
  });
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // Handle receipt upload and OCR
  const handleReceiptUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        let worker;
        try {
          const imageUrl = event.target?.result;
          
          if (!imageUrl) {
            throw new Error('Failed to read file');
          }

          // Initialize Tesseract worker
          worker = await Tesseract.createWorker('eng');
          
          // Recognize text from image
          const result = await worker.recognize(imageUrl);
          const text = result.data.text;

          console.log('Extracted text:', text);

          if (!text || text.trim().length === 0) {
            setError('No text found in receipt image. Try a clearer photo.');
            setOcrLoading(false);
            return;
          }

          // Extract transaction details
          const extracted = extractTransactionDetails(text);

          // Auto-fill form with extracted data
          const formUpdate = {};
          if (extracted.amount) formUpdate.amount = extracted.amount;
          if (extracted.note) formUpdate.note = extracted.note;
          if (extracted.category) formUpdate.category = extracted.category;

          setForm((prev) => ({
            ...prev,
            ...formUpdate,
          }));

          // Show success/warning based on what was found
          if (extracted.amount && extracted.category) {
            setError(''); // Perfect match
          } else if (extracted.amount || extracted.category || extracted.note) {
            setError('✓ Partial details extracted. Please complete the form.'); // Partial success
          } else {
            setError('Receipt text extracted but no details found. Please enter manually.'); // No details
          }
        } catch (err) {
          console.error('OCR Error:', err);
          setError('Receipt processing failed. Please enter details manually.');
        } finally {
          // Cleanup worker
          if (worker) {
            await worker.terminate();
          }
          setOcrLoading(false);
        }
      };

      reader.onerror = () => {
        setError('Failed to read file. Please try again.');
        setOcrLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Upload Error:', err);
      setError('Failed to read file. Please try again.');
      setOcrLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || !form.category) {
      setError('Amount and category are required.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/transactions', {
        ...form,
        amount: parseFloat(form.amount),
      });
      onSuccess(); // tell the parent to refresh data
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add transaction.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Transaction</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {/* Income / Expense toggle */}
          <div className="form-group">
            <label className="form-label">Type</label>
            <div className="type-toggle">
              <button
                type="button"
                className={`type-btn income ${form.type === 'income' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, type: 'income', category: '' })}
              >
                📈 Income
              </button>
              <button
                type="button"
                className={`type-btn expense ${form.type === 'expense' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, type: 'expense', category: '' })}
              >
                📉 Expense
              </button>
            </div>
          </div>

          {/* Receipt Upload (OCR) */}
          <div className="form-group">
            <label className="form-label">📸 Upload Receipt (Optional)</label>
            <input
              type="file"
              accept="image/*"
              className="form-input"
              onChange={handleReceiptUpload}
              disabled={ocrLoading}
            />
            {ocrLoading && <p className="form-hint">🔄 Processing receipt...</p>}
          </div>

          {/* Amount */}
          <div className="form-group">
            <label className="form-label">Amount (₦)</label>
            <input
              type="number"
              name="amount"
              className="form-input"
              placeholder="e.g. 5000"
              value={form.amount}
              onChange={handleChange}
              min="1"
              step="any"
              required
            />
          </div>

          {/* Category */}
          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              name="category"
              className="form-select"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">Select a category</option>
              {/* Filter categories by type */}
              {CATEGORIES
                .filter((cat) => {
                  if (form.type === 'income')  return ['Salary', 'Business', 'Other'].includes(cat);
                  if (form.type === 'expense') return !['Salary', 'Business'].includes(cat);
                  return true;
                })
                .map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
          </div>

          {/* Note */}
          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <input
              type="text"
              name="note"
              className="form-input"
              placeholder="e.g. Grocery run at Shoprite"
              value={form.note}
              onChange={handleChange}
              maxLength={100}
            />
          </div>

          {/* Date */}
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              name="date"
              className="form-input"
              value={form.date}
              onChange={handleChange}
              max={today}
              required
            />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default TransactionForm;
