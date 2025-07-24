import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { TRANSACTION_TYPES } from '../db';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const InfoCard = ({ title, value, color }) => (
  <div className="info-card" style={{ borderLeftColor: color }}>
    <h4>{title}</h4>
    <p style={{ color }}>¥ {value.toFixed(2)}</p>
  </div>
);

function Dashboard({ transactions }) {
  const totalIncome = transactions
    .filter(t => t.type === TRANSACTION_TYPES.INCOME)
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);
  
  const totalExpense = transactions
    .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
    .reduce((acc, t) => acc + Number(t.amount || 0), 0);

  const balance = totalIncome - totalExpense;

  const expenseByCategory = transactions
    .filter(t => t.type === TRANSACTION_TYPES.EXPENSE)
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + Number(t.amount || 0);
      return acc;
    }, {});
  
  const chartData = {
    labels: Object.keys(expenseByCategory),
    datasets: [{
      data: Object.values(expenseByCategory),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        '#E7E9ED', '#8DDF3C', '#F976D3', '#5A2A27'
      ],
      hoverBackgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
        '#E7E9ED', '#8DDF3C', '#F976D3', '#5A2A27'
      ]
    }]
  };
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: '支出类别分布',
        font: { size: 18 }
      },
    },
  };

  return (
    <div>
      <div className="dashboard-summary">
        <InfoCard title="总收入" value={totalIncome} color="#2ecc71" />
        <InfoCard title="总支出" value={totalExpense} color="#e74c3c" />
        <InfoCard title="结余" value={balance} color="#3498db" />
      </div>

      <div className="card chart-container">
        {Object.keys(expenseByCategory).length > 0 ? (
          <Doughnut data={chartData} options={chartOptions} />
        ) : (
          <div className="no-data-placeholder">
            <p>暂无支出数据以生成图表</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard; 