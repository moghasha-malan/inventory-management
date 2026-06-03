import { useState, useEffect } from 'react'
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api'

function Products() {
  const [products, setProducts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', sku: '', price: '', quantity: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    getProducts().then(res => setProducts(res.data)).catch(() => setError('Failed to load products'))
  }

  useEffect(load, [])

  const resetForm = () => {
    setForm({ name: '', sku: '', price: '', quantity: '' })
    setEditing(null)
    setShowForm(false)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.name || !form.sku || !form.price || form.quantity === '') {
      setError('All fields are required')
      return
    }

    const payload = {
      name: form.name,
      sku: form.sku,
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
    }

    if (payload.price <= 0) { setError('Price must be greater than 0'); return }
    if (payload.quantity < 0) { setError('Quantity cannot be negative'); return }

    try {
      if (editing) {
        await updateProduct(editing.id, payload)
        setSuccess('Product updated successfully')
      } else {
        await createProduct(payload)
        setSuccess('Product created successfully')
      }
      resetForm()
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred')
    }
  }

  const handleEdit = (product) => {
    setForm({
      name: product.name,
      sku: product.sku,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
    })
    setEditing(product)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    try {
      await deleteProduct(id)
      setSuccess('Product deleted successfully')
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete product')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <p>Manage your product inventory</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h2>All Products ({products.length})</h2>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>
            + Add Product
          </button>
        </div>

        {products.length === 0 ? (
          <div className="empty-state">No products yet. Add your first product!</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{p.sku}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${p.quantity === 0 ? 'badge-danger' : p.quantity <= 10 ? 'badge-warning' : 'badge-success'}`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(p)} style={{ marginRight: 8 }}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) resetForm() }}>
          <div className="modal">
            <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Enter product name" />
              </div>
              <div className="form-group">
                <label>SKU / Code</label>
                <input value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} placeholder="Enter unique SKU" />
              </div>
              <div className="form-group">
                <label>Price ($)</label>
                <input type="number" step="0.01" min="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Quantity in Stock</label>
                <input type="number" min="0" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} placeholder="0" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'} Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
