import Dexie from 'dexie';

const db = new Dexie('MoneyTrackerDB');

// Increment the version number to trigger a schema upgrade
db.version(2).stores({
  transactions: '++id, type, amount, category, date, description',
  categories: '++id, type, name'
});

// For any older versions, you might want to define upgrade paths,
// but for this simple case, just creating the stores in the new version is enough.
db.version(1).stores({
  transactions: '++id, type, amount, category, date, description',
  // categories store did not exist in version 1
});


export const TRANSACTION_TYPES = {
  INCOME: '收入',
  EXPENSE: '支出'
};

export const DEFAULT_INCOME_CATEGORIES = [
  '工资', '奖金', '投资收益', '兼职', '礼金', '报销', '其他收入'
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  '饮食', '住房', '交通', '购物', '娱乐', '医疗', '教育',
  '旅游', '数码', '生活用品', '其他支出'
];

export const initCategories = async () => {
  try {
    // Make sure the database is open before we interact with it.
    await db.open();
    const count = await db.categories.count();
    if (count === 0) {
      const categoriesToAdd = [
        ...DEFAULT_INCOME_CATEGORIES.map(name => ({ type: TRANSACTION_TYPES.INCOME, name })),
        ...DEFAULT_EXPENSE_CATEGORIES.map(name => ({ type: TRANSACTION_TYPES.EXPENSE, name }))
      ];
      await db.categories.bulkAdd(categoriesToAdd);
    }
  } catch (error) {
    console.error("Failed to initialize categories:", error);
    // This can happen if the db version is old. A page refresh after schema update usually fixes this.
  }
};

initCategories();

export const getAllCategories = () => db.categories.toArray();
export const getCategoriesByType = (type) => db.categories.where('type').equals(type).toArray();
export const addCategory = (category) => db.categories.add(category);
export const updateCategory = (id, name) => db.categories.update(id, { name });

export const deleteCategory = async (id) => {
  const categoryToDelete = await db.categories.get(id);
  if (!categoryToDelete) {
    console.warn(`Category with id ${id} not found, cannot delete.`);
    return;
  }
  
  const transactionCount = await db.transactions
    .where('category').equals(categoryToDelete.name)
    .count();
  
  if (transactionCount > 0) {
    throw new Error('此类别已被使用，无法删除');
  }
  
  return db.categories.delete(id);
};

export const addTransaction = (transaction) => {
  if (typeof transaction.date === 'string') {
    transaction.date = new Date(transaction.date);
  }
  return db.transactions.add(transaction);
};

export const updateTransaction = (id, changes) => {
  if (changes.date && typeof changes.date === 'string') {
    changes.date = new Date(changes.date);
  }
  return db.transactions.update(id, changes);
};

export const deleteTransaction = (id) => db.transactions.delete(id);
export const getAllTransactions = () => db.transactions.toArray();
export const getTransactionsByType = (type) => db.transactions.where('type').equals(type).toArray();
export const getTransactionsByDateRange = (startDate, endDate) => {
  return db.transactions.where('date').between(startDate, endDate).toArray();
};
export const getTransactionById = (id) => db.transactions.get(id);

export default db;

