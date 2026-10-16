import { useState, useEffect } from "react";
import "./App.css";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

//const API_BASE = "http://localhost:5000/api";
const API_BASE = "http://127.0.0.1:5000/api";
const CATEGORIES = ["Food", "Transport", "Bills", "Shopping", "Entertainment", "Salary", "Other"];

function App() {
  // --- Authentication States ---
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [authUser, setAuthUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  // --- App States ---
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);

  // Filter States
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterMonth, setFilterMonth] = useState("");

  // Transaction Form States
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");

  // Budget Form States
  const [budgetCategory, setBudgetCategory] = useState("Food");
  const [budgetLimit, setBudgetLimit] = useState("");

  const [editId, setEditId] = useState(null);

  const handleEdit = (transaction) => {
    setTitle(transaction.title); 
    setAmount(transaction.amount);
    setType(transaction.type);
    setCategory(transaction.category);
    setEditId(transaction._id);
  };

  // Chart එක සඳහා වියදම් දත්ත සකස් කිරීම
  const expenseData = transactions
    .filter(t => t.type === "expense")
    .reduce((acc, curr) => {
      const existing = acc.find(item => item.name === curr.category);
      if (existing) {
        existing.value += curr.amount;
      } else {
        acc.push({ name: curr.category, value: curr.amount });
      }
      return acc;
    }, []);

  const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

  // Login වුණාට පස්සේ විතරක් Data ගන්න
  useEffect(() => {
    if (token) {
      fetchTransactions();
      fetchBudgets();
    }
  }, [token]);

  // --- Auth Functions ---
  const handleAuth = async (e) => {
    e.preventDefault();
    const endpoint = isLoginMode ? "login" : "register";
    const body = isLoginMode
      ? { email: authEmail, password: authPassword }
      : { name: authName, email: authEmail, password: authPassword };

    const res = await fetch(`${API_BASE}/auth/${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (res.ok) {
      setToken(data.token);
      setAuthUser(data.user);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setAuthEmail("");
      setAuthPassword("");
      setAuthName("");
    } else {
      alert(data.message || "Authentication failed!");
    }
  };

  const handleLogout = () => {
    setToken("");
    setAuthUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setTransactions([]);
    setBudgets([]);
  };

  // --- Data Fetching & Operations ---
  const fetchTransactions = async () => {
    const res = await fetch(`${API_BASE}/transactions`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTransactions(data);
  };

  const fetchBudgets = async () => {
    const res = await fetch(`${API_BASE}/budgets`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setBudgets(data);
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!title || !amount) return;
    const method = editId ? "PUT" : "POST";
    const url = editId 
        ? `${API_BASE}/transactions/${editId}` 
        : `${API_BASE}/transactions`;

    const res = await fetch(url, {
        method: method,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ title, amount: Number(amount), type, category })
    });

    if (res.ok) {
        setTitle("");
        setAmount("");
        setEditId(null);
        fetchTransactions();
    }
  };

  const handleDeleteTransaction = async (id) => {
    await fetch(`${API_BASE}/transactions/${id}`, { 
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTransactions();
  };

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    if (!budgetLimit) return;
    const res = await fetch(`${API_BASE}/budgets`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ category: budgetCategory, limit: Number(budgetLimit) }),
    });
    if (res.ok) {
      setBudgetLimit("");
      fetchBudgets();
    }
  };

  // CSV Export කිරීමේ Function එක 
  const exportToCSV = () => {
    if (transactions.length === 0) {
      alert("No transactions to export!");
      return;
    }
    const headers = ["Title,Amount,Type,Category\n"];
    const csvData = transactions.map(t => {
      return `"${t.title}",${t.amount},${t.type},${t.category}`;
    });
    const blob = new Blob([headers + csvData.join("\n")], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", "budget_transactions.csv");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- Calculations & Filters ---
  const totalIncome = transactions.filter((t) => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const balance = totalIncome - totalExpense;

  const filteredTransactions = transactions.filter((t) => {
    const matchCategory = filterCategory === "All" || t.category === filterCategory;
    const matchMonth = filterMonth === "" || t.date.substring(0, 7) === filterMonth;
    return matchCategory && matchMonth;
  });

  // --- Login / Register UI ---
  if (!token) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h2>{isLoginMode ? "Welcome Back! 👋" : "Create Account 🚀"}</h2>
          <p>{isLoginMode ? "Login to manage your expenses" : "Sign up to get started"}</p>
          
          <form onSubmit={handleAuth}>
            {!isLoginMode && (
              <input
                type="text"
                placeholder="Full Name"
                value={authName}
                onChange={(e) => setAuthName(e.target.value)}
                required
              />
            )}
            <input
              type="email"
              placeholder="Email Address"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              required
            />
            <button type="submit" className="btn-primary" style={{ cursor: 'pointer' }}>
              {isLoginMode ? "Login" : "Register"}
            </button>
          </form>

          <p className="auth-switch">
            {isLoginMode ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setIsLoginMode(!isLoginMode)} style={{ cursor: 'pointer' }}>
              {isLoginMode ? "Register here" : "Login here"}
            </span>
          </p>
        </div>
      </div>
    );
  }

  // --- Dashboard UI ---
  return (
    <div className="container">
      <header className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>💰 Expense & Budget Tracker</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <strong>👤 {authUser?.name}</strong>
          <button onClick={handleLogout} className="btn-logout" style={{ cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="card balance">
          <h3>Total Balance</h3>
          <p>Rs. {balance.toLocaleString()}</p>
        </div>
        <div className="card income">
          <h3>Total Income</h3>
          <p>+ Rs. {totalIncome.toLocaleString()}</p>
        </div>
        <div className="card expense">
          <h3>Total Expense</h3>
          <p>Rs. {totalExpense.toLocaleString()}</p>
        </div>
      </div>

      <div className="main-grid">
        {/* Left Column: Forms */}
        <div className="forms-column">
          <div className="panel">
            <h2>Add Transaction</h2>
            <form onSubmit={handleAddTransaction}>
              <input
                type="text"
                placeholder="Description (e.g., Lunch, Bus Fare)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Amount (Rs.)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <div className="row">
                <select value={type} onChange={(e) => setType(e.target.value)}>
                  <option value="expense">Expense (-)</option>
                  <option value="income">Income (+)</option>
                </select>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary" style={{ cursor: 'pointer' }}>Add Transaction</button>
            </form>
          </div>

          <div className="panel">
            <h2>Set Monthly Budget</h2>
            <form onSubmit={handleSaveBudget}>
              <div className="row">
                <select value={budgetCategory} onChange={(e) => setBudgetCategory(e.target.value)}>
                  {CATEGORIES.filter((c) => c !== "Salary").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  placeholder="Limit (Rs.)"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-secondary" style={{ cursor: 'pointer' }}>Save Budget Limit</button>
            </form>
          </div>
        </div>

        {/* Right Column: Budgets & Transactions List */}
        <div className="data-column">
          <div className="panel">
            <h2>Budget Status</h2>
            {budgets.length === 0 ? (
              <p className="empty-text">No budgets set yet.</p>
            ) : (
              budgets.map((b) => {
                const spent = transactions
                  .filter((t) => t.type === "expense" && t.category === b.category)
                  .reduce((acc, t) => acc + t.amount, 0);
                const percent = Math.min((spent / b.limit) * 100, 100);
                const isOver = spent > b.limit;

                return (
                  <div key={b._id} className="budget-item">
                    <div className="budget-header">
                      <strong>{b.category}</strong>
                      <span className={isOver ? "over-limit" : ""}>
                        Rs. {spent.toLocaleString()} / Rs. {b.limit.toLocaleString()}
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-fill ${isOver ? "danger" : ""}`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          <div className="panel" style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ marginBottom: '15px' }}>Expenses by Category</h2>
              {expenseData.length > 0 ? (
                <PieChart width={400} height={300}>
                  <Pie
                    data={expenseData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {expenseData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              ) : (
                <p className="empty-text">No expenses to show in chart.</p>
              )}
            </div>
          </div>
          <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '8px', marginBottom: '15px' }}>
              
              <h2 style={{ border: 'none', margin: 0, padding: 0 }}>Recent Transactions</h2>
              
              {/* CSV Export Button */}
              <button 
                onClick={exportToCSV} 
                style={{ backgroundColor: '#28a745', color: 'white', padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Export CSV
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '6px', borderRadius: '5px', border: '1px solid #ddd' }}>
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  style={{ padding: '6px', borderRadius: '5px', border: '1px solid #ddd' }}
                />
              </div>
            </div>

            {filteredTransactions.length === 0 ? (
              <p className="empty-text">No transactions found for the selected filters.</p>
            ) : (
              <ul className="transaction-list">
                {filteredTransactions.map((t) => (
                  <li key={t._id} className={`transaction-item ${t.type}`}>
                    <div>
                      <strong>{t.title}</strong>
                      <span className="badge">{t.category}</span>
                    </div>
                    <div className="amount-actions">
                      <span className={t.type === "income" ? "text-green" : "text-red"}>
                        {t.type === "income" ? "+" : "-"} Rs. {t.amount.toLocaleString()}
                      </span>
                      <button 
                        onClick={() => handleEdit(t)} 
                        style={{ backgroundColor: 'orange', color: 'white', marginRight: '10px', padding: '5px 10px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteTransaction(t._id)} 
                        className="delete-btn"
                        style={{ cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;