import React, { useState, useEffect } from 'react';
import { 
  addTransaction, 
  updateTransaction, 
  TRANSACTION_TYPES,
} from '../db';

function TransactionForm({ onTransactionAdded, editTransaction, onCancelEdit, categories }) {
  const [formData, setFormData] = useState({
    type: TRANSACTION_TYPES.EXPENSE,
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default category when categories are loaded or type changes
  useEffect(() => {
    const currentCategoryType = formData.type === TRANSACTION_TYPES.INCOME ? 'income' : 'expense';
    const availableCategories = categories[currentCategoryType];
    if (availableCategories.length > 0 && !availableCategories.find(c => c.name === formData.category)) {
      setFormData(prev => ({
        ...prev,
        category: availableCategories[0].name
      }));
    } else if (availableCategories.length === 0) {
      setFormData(prev => ({ ...prev, category: '' }));
    }
  }, [formData.type, categories]);
  
  // When edit mode is activated, load the transaction data
  useEffect(() => {
    if (editTransaction) {
      const formattedDate = new Date(editTransaction.date).toISOString().split('T')[0];
      setFormData({
        type: editTransaction.type,
        amount: editTransaction.amount,
        category: editTransaction.category,
        date: formattedDate,
        description: editTransaction.description
      });
    }
  }, [editTransaction]);

  const validateForm = () => {
    const errors = {};
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      errors.amount = '请输入有效的金额';
    }
    if (!formData.category) {
      errors.category = '请选择类别';
    }
    if (!formData.date) {
      errors.date = '请选择日期';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      if (editTransaction) {
        await updateTransaction(editTransaction.id, { ...formData, amount: Number(formData.amount) });
      } else {
        await addTransaction({ ...formData, amount: Number(formData.amount) });
      }
      setFormData({
        type: TRANSACTION_TYPES.EXPENSE,
        amount: '',
        category: categories.expense.length > 0 ? categories.expense[0].name : '',
        date: new Date().toISOString().split('T')[0],
        description: ''
      });
      onTransactionAdded();
      if (editTransaction) {
        onCancelEdit();
      }
      alert(editTransaction ? '交易记录更新成功' : '交易记录添加成功');
    } catch (error) {
      console.error('交易记录保存失败:', error);
      alert('交易记录保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategories = formData.type === TRANSACTION_TYPES.INCOME ? categories.income : categories.expense;

  return (
    <div className="card">
      <h2>{editTransaction ? '编辑记录' : '添加新记录'}</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>类型</label>
          <select
            name="type"
            className="form-control"
            value={formData.type}
            onChange={handleChange}
          >
            <option value={TRANSACTION_TYPES.INCOME}>{TRANSACTION_TYPES.INCOME}</option>
            <option value={TRANSACTION_TYPES.EXPENSE}>{TRANSACTION_TYPES.EXPENSE}</option>
          </select>
        </div>

        <div className="form-group">
          <label>金额</label>
          <input
            type="number"
            name="amount"
            step="0.01"
            min="0.01"
            className="form-control"
            value={formData.amount}
            onChange={handleChange}
            placeholder="请输入金额"
          />
          {formErrors.amount && <p style={{ color: 'red' }}>{formErrors.amount}</p>}
        </div>

        <div className="form-group">
          <label>类别</label>
          <select
            name="category"
            className="form-control"
            value={formData.category}
            onChange={handleChange}
          >
            {currentCategories.map(category => (
              <option key={category.id} value={category.name}>{category.name}</option>
            ))}
          </select>
          {formErrors.category && <p style={{ color: 'red' }}>{formErrors.category}</p>}
        </div>

        <div className="form-group">
          <label>日期</label>
          <input
            type="date"
            name="date"
            className="form-control"
            value={formData.date}
            onChange={handleChange}
          />
          {formErrors.date && <p style={{ color: 'red' }}>{formErrors.date}</p>}
        </div>

        <div className="form-group">
          <label>描述</label>
          <textarea
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            placeholder="可选描述"
            rows="3"
          ></textarea>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : editTransaction ? '更新' : '保存'}
          </button>

          {editTransaction && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelEdit}
              disabled={isSubmitting}
            >
              取消
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

export default TransactionForm; 