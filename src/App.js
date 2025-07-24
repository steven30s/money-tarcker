import React, { useState, useEffect } from 'react';
import { getAllTransactions, getAllCategories, TRANSACTION_TYPES } from './db';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import TransactionList from './components/TransactionList';
import CategoryManager from './components/CategoryManager';

function App() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState({ income: [], expense: [] });
  const [activeTab, setActiveTab] = useState('dashboard');
  const [editTransaction, setEditTransaction] = useState(null);

  useEffect(() => {
    loadTransactions();
    loadCategories();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await getAllTransactions();
      setTransactions(data);
    } catch (error) {
      console.error('加载交易记录失败:', error);
      alert('加载交易记录失败，请刷新页面重试');
    }
  };

  const loadCategories = async () => {
    try {
      const allData = await getAllCategories();
      setCategories({
        income: allData.filter(c => c.type === TRANSACTION_TYPES.INCOME),
        expense: allData.filter(c => c.type === TRANSACTION_TYPES.EXPENSE)
      });
    } catch (error) {
      console.error('加载类别失败:', error);
      alert('加载类别失败，请刷新页面重试');
    }
  };

  const handleEdit = (transaction) => {
    setEditTransaction(transaction);
    setActiveTab('add');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab !== 'add') {
      setEditTransaction(null);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard transactions={transactions} />;
      case 'add':
        return (
          <TransactionForm
            onTransactionAdded={() => {
              loadTransactions();
              // A new transaction might use a new category, so we could reload them
              // but for now, let's assume category usage doesn't change categories themselves.
            }}
            editTransaction={editTransaction}
            onCancelEdit={() => {
              setEditTransaction(null);
              setActiveTab('list');
            }}
            categories={categories}
          />
        );
      case 'list':
        return (
          <TransactionList
            transactions={transactions}
            onEdit={handleEdit}
            onDeleteSuccess={loadTransactions}
          />
        );
      case 'categories':
        return <CategoryManager onCategoriesUpdated={loadCategories} categories={categories} />;
      default:
        return <Dashboard transactions={transactions} />;
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>妈咪记账本</h1>
      </header>

      <nav className="tabs">
        <div
          className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => handleTabChange('dashboard')}
        >
          总览
        </div>
        <div
          className={`tab ${activeTab === 'add' ? 'active' : ''}`}
          onClick={() => handleTabChange('add')}
        >
          {editTransaction ? '编辑交易记录' : '添加交易记录'}
        </div>
        <div
          className={`tab ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => handleTabChange('list')}
        >
          所有交易记录
        </div>
        <div
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => handleTabChange('categories')}
        >
          类别管理
        </div>
      </nav>

      <main className="content">
        {renderContent()}
      </main>

      <footer className="footer">
        <p>© 2024 Money Tracker. All Rights Reserved.</p>
      </footer>
    </div>
  );
}

export default App; 