import { useState, useEffect } from 'react'
import { getCustomers, createCustomer, deleteCustomer } from '../api'

function Customers() {
  const [customers, setCustomers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ full_name: '', email: '', phone: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    getCustomers().then(res => setCustomers(res.data)).catch(() => setError('Failed to load customers'))
  }

  useEffect(load, [])

  const resetForm = () => {
    setForm({ full_name: '', email: '', phone: '' })
    setShowForm(false)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!form.full_name || !form.email || !form.phone) {
      setError('All fields are required')
      return
    }

    try {
      await createCustomer(form)
      setSuccess('Customer created successfully')
      resetForm()
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return
    try {
      await deleteCustomer(id)
      setSuccess('Customer deleted successfully')
      load()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to delete customer')
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Customers</h1>
        <p>Manage your customer database</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="card">
        <div className="card-header">
          <h2>All Customers ({customers.length})</h2>
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>
            + Add Customer
          </button>
        </div>

        {customers.length === 0 ? (
          <div className="empty-state">No customers yet. Add your first customer!</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(c => (
                <tr key={c.id}>
                  <td><strong>{c.full_name}</strong></td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>Delete</button>
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
            <h2>Add Customer</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Enter full name" />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@example.com" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Enter phone number" />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Customers
