import React from 'react';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { TRANSACTION_TYPES, deleteTransaction } from '../db';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

function TransactionList({ transactions, onEdit, onDeleteSuccess }) {
  const sortedTransactions = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleDelete = async (id) => {
    if (window.confirm('确定要删除这条记录吗？')) {
      try {
        await deleteTransaction(id);
        onDeleteSuccess();
        alert('记录已成功删除');
      } catch (error) {
        console.error('删除记录失败:', error);
        alert('删除记录失败，请重试');
      }
    }
  };

  return (
    <div className="card">
      <h2>所有记录</h2>
      {sortedTransactions.length > 0 ? (
        <ul className="transaction-list">
          {sortedTransactions.map(transaction => (
            <li key={transaction.id} className="transaction-item">
              <div className={`type-indicator ${transaction.type === TRANSACTION_TYPES.INCOME ? 'income' : 'expense'}`}></div>
              <div className="transaction-details">
                <span className="transaction-category">{transaction.category}</span>
                <span className="transaction-description">{transaction.description || '暂无描述'}</span>
              </div>
              <div className="transaction-info">
                <span className="transaction-date">{formatDate(transaction.date)}</span>
                <span className={`transaction-amount ${transaction.type === TRANSACTION_TYPES.INCOME ? 'income-amount' : 'expense-amount'}`}>
                  {transaction.type === TRANSACTION_TYPES.INCOME ? '+' : '-'} ¥{Number(transaction.amount || 0).toFixed(2)}
                </span>
              </div>
              <div className="transaction-actions">
                <button onClick={() => onEdit(transaction)} className="btn-icon">
                  <FaEdit />
                </button>
                <button onClick={() => handleDelete(transaction.id)} className="btn-icon">
                  <FaTrashAlt />
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="no-data-placeholder">暂无交易记录</p>
      )}
    </div>
  );
}

export default TransactionList;
