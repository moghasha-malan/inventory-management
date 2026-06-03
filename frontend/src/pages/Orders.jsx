import { useState, useEffect } from 'react'
import { getOrders, getOrder, createOrder, deleteOrder, getCustomers, getProducts } from '../api'

function Orders() {
  const [orders, setOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [form, setForm] = useState({ customer_id: '', items: [{ product_id: '', quantity: '' }] })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    getOrders().then(res => setOrders(res.data)).catch(() => setError('Failed to load orders'))
  }

  useEffect(() => {
    load()
    getCustomers().then(res => setCustomers(res.data))
    getProducts().then(res => setProducts(res.data))
  }, [])

  const resetForm = () => {
    setForm({ customer_id: '', items: [{ product_id: '', quantity: '' }] })
    setShowForm(false)
    setError('')
  }

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { product_id: '', quantity: '' }] })
  }

  const removeItem = (index) => {
    if (form.items.length === 1) return
    setForm({ ...form, items: form.items.filter((_, i) => i !== index) })
  }

  const updateItem = (index, field, value) => {
    const items = [...form.items]
    items[index] = { ...items[index], [field]: value }
    setForm({ ...form, items })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.customer_id) { setError('Please select a customer'); return }
    if (form.items.some(i => !i.product_id || !i.quantity)) {
      setError('All order items must have a product and quantity')
      return
    }

    const payload = {
      customer_id: parseInt(form.customer_id),
      items: form.items.map(i => ({
        product_id: parseInt(i.product_id),
        quantity: parseInt(i.quantity),
      })),
    }

    try {
      await createOrder(payload)
      setSuccess('Order created successfully')
      resetForm()
      load()
      getProducts().then(res => setProducts(res.data))
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    try {
      await deleteOrder(id)
      setSuccess('Order cancelled successfully')
      setSelectedOrder(null)
      load()
      getProducts().then(res => setProducts(res.data))
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to cancel order')
    }
  }

  const viewOrder = async (id) => {
    try {
      const res = await getOrder(id)
      setSelectedOrder(res.data)
    } catch {
      setError('Failed to load order details')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Orders</h1>
        <p>Manage customer orders</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h2>All Orders ({orders.length})</h2>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>
            + Create Order
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">No orders yet. Create your first order!</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><strong>#{o.id}</strong></td>
                  <td>{o.customer?.full_name || 'N/A'}</td>
                  <td>{o.items?.length || 0} items</td>
                  <td>${o.total_amount.toFixed(2)}</td>
                  <td><span className="badge badge-success">{o.status}</span></td>
                  <td>{new Date(o.created_at).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => viewOrder(o.id)} style={{ marginRight: 8 }}>View</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Cancel</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedOrder(null) }}>
          <div className="modal">
            <h2>Order #{selectedOrder.id}</h2>
            <div className="order-detail">
              <div className="detail-grid">
                <div className="detail-item">
                  <label>Customer</label>
                  <p>{selectedOrder.customer?.full_name}</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <p><span className="badge badge-success">{selectedOrder.status}</span></p>
                </div>
                <div className="detail-item">
                  <label>Total Amount</label>
                  <p>${selectedOrder.total_amount.toFixed(2)}</p>
                </div>
                <div className="detail-item">
                  <label>Date</label>
                  <p>{new Date(selectedOrder.created_at).toLocaleString()}</p>
                </div>
              </div>

              <h3 style={{ marginBottom: 12 }}>Order Items</h3>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map(item => {
                    const prod = products.find(p => p.id === item.product_id)
                    return (
                      <tr key={item.id}>
                        <td>{prod?.name || `Product #${item.product_id}`}</td>
                        <td>{item.quantity}</td>
                        <td>${item.unit_price.toFixed(2)}</td>
                        <td>${item.subtotal.toFixed(2)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="form-actions">
              <button className="btn btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Create Order Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) resetForm() }}>
          <div className="modal">
            <h2>Create Order</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Customer</label>
                <select value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
                  <option value="">Select a customer</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.email})</option>
                  ))}
                </select>
              </div>

              <label style={{ fontWeight: 500, fontSize: 13, marginBottom: 8, display: 'block' }}>Order Items</label>
              {form.items.map((item, index) => (
                <div key={index} className="order-item-row">
                  <div className="form-group">
                    <select value={item.product_id} onChange={e => updateItem(index, 'product_id', e.target.value)}>
                      <option value="">Select product</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.quantity})</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{ maxWidth: 100 }}>
                    <input
                      type="number"
                      min="1"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={e => updateItem(index, 'quantity', e.target.value)}
                    />
                  </div>
                  <button type="button" className="btn btn-danger btn-sm" onClick={() => removeItem(index)}>X</button>
                </div>
              ))}
              <button type="button" className="btn btn-secondary btn-sm" onClick={addItem} style={{ marginBottom: 16 }}>
                + Add Item
              </button>

              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
