import { useState, useEffect } from 'react'
import { getDashboard } from '../api'

function Dashboard() {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getDashboard()
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard data'))
  }, [])

  if (error) return <div className="alert alert-error">{error}</div>
  if (!data) return <p>Loading...</p>

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of your inventory and orders</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Total Products</div>
          <div className="value">{data.total_products}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Customers</div>
          <div className="value">{data.total_customers}</div>
        </div>
        <div className="stat-card">
          <div className="label">Total Orders</div>
          <div className="value">{data.total_orders}</div>
        </div>
        <div className={`stat-card ${data.low_stock_products.length > 0 ? 'warning' : ''}`}>
          <div className="label">Low Stock Items</div>
          <div className="value">{data.low_stock_products.length}</div>
        </div>
      </div>

      {data.low_stock_products.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>Low Stock Products (10 or fewer)</h2>
          </div>
          <div className="low-stock-list">
            {data.low_stock_products.map(p => (
              <div key={p.id} className="low-stock-item">
                <div>
                  <strong>{p.name}</strong>
                  <span style={{ color: '#999', marginLeft: 8 }}>SKU: {p.sku}</span>
                </div>
                <span className={`badge ${p.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                  {p.quantity} in stock
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
