import React, { useState } from 'react';
import { 
  addCategory, 
  updateCategory, 
  deleteCategory,
  TRANSACTION_TYPES 
} from '../db';
import { FaPlus, FaSave, FaTimes, FaPen, FaTrash } from 'react-icons/fa';

function CategoryManager({ categories, onCategoriesUpdated }) {
  const [newCategory, setNewCategory] = useState({
    type: TRANSACTION_TYPES.EXPENSE,
    name: ''
  });
  
  const [editingCategory, setEditingCategory] = useState(null);
  const [error, setError] = useState('');
  
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.name.trim()) {
      setError('请输入类别名称');
      return;
    }
    const existing = newCategory.type === TRANSACTION_TYPES.INCOME ? categories.income : categories.expense;
    if (existing.some(c => c.name === newCategory.name.trim())) {
      setError('类别名称已存在');
      return;
    }
    try {
      await addCategory({ type: newCategory.type, name: newCategory.name.trim() });
      setNewCategory({ type: TRANSACTION_TYPES.EXPENSE, name: '' });
      setError('');
      onCategoriesUpdated();
    } catch (error) {
      console.error('添加类别失败:', error);
      setError('添加类别失败，请重试');
    }
  };
  
  const handleStartEdit = (category) => {
    setEditingCategory({ ...category, newName: category.name });
  };
  
  const handleSaveEdit = async () => {
    if (!editingCategory.newName.trim()) {
      setError('请输入类别名称');
      return;
    }
    const existing = editingCategory.type === TRANSACTION_TYPES.INCOME ? categories.income : categories.expense;
    if (existing.some(c => c.name === editingCategory.newName.trim() && c.id !== editingCategory.id)) {
      setError('类别名称已存在');
      return;
    }
    try {
      await updateCategory(editingCategory.id, editingCategory.newName.trim());
      setEditingCategory(null);
      setError('');
      onCategoriesUpdated();
    } catch (error) {
      console.error('更新类别失败:', error);
      setError('更新类别失败，请重试');
    }
  };
  
  const handleCancelEdit = () => {
    setEditingCategory(null);
    setError('');
  };
  
  const handleDeleteCategory = async (category) => {
    if (window.confirm(`确定要删除"${category.name}"类别吗？`)) {
      try {
        await deleteCategory(category.id);
        onCategoriesUpdated();
      } catch (error) {
        console.error('删除类别失败:', error);
        setError(error.message || '删除类别失败，请重试');
      }
    }
  };

  const renderCategoryList = (type, title) => (
    <div className="category-list-wrapper">
      <h3>{title}</h3>
      {categories[type].length > 0 ? (
        <ul className="category-list">
          {categories[type].map(category => (
            <li key={category.id} className="category-item">
              {editingCategory && editingCategory.id === category.id ? (
                <div className="edit-form">
                  <input
                    type="text"
                    className="form-control"
                    value={editingCategory.newName}
                    onChange={(e) => setEditingCategory(prev => ({ ...prev, newName: e.target.value }))}
                  />
                  <button type="button" className="btn-icon" onClick={handleSaveEdit}><FaSave /></button>
                  <button type="button" className="btn-icon" onClick={handleCancelEdit}><FaTimes /></button>
                </div>
              ) : (
                <>
                  <span>{category.name}</span>
                  <div className="category-actions">
                    <button className="btn-icon" onClick={() => handleStartEdit(category)}><FaPen /></button>
                    <button className="btn-icon" onClick={() => handleDeleteCategory(category)}><FaTrash /></button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-data-placeholder">暂无{title}</p>
      )}
    </div>
  );
  
  return (
    <div className="card">
      <h2>类别管理</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleAddCategory} className="add-category-form">
        <div className="form-group-inline">
            <select
              className="form-control"
              value={newCategory.type}
              onChange={(e) => setNewCategory(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value={TRANSACTION_TYPES.EXPENSE}>{TRANSACTION_TYPES.EXPENSE}</option>
              <option value={TRANSACTION_TYPES.INCOME}>{TRANSACTION_TYPES.INCOME}</option>
            </select>
            <input 
              type="text" 
              className="form-control"
              placeholder="输入新类别名称" 
              value={newCategory.name}
              onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
        <button type="submit" className="btn btn-primary">
          <FaPlus /> 添加
        </button>
      </form>
      
      <div className="category-lists-container">
        {renderCategoryList('expense', '支出类别')}
        {renderCategoryList('income', '收入类别')}
      </div>
      
      <div className="note">
        <p>提示：已被使用的类别无法删除，以确保交易记录的完整性。</p>
      </div>
    </div>
  );
}

export default CategoryManager; 