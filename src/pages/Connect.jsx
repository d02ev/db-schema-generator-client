import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Connect() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    dbUrl: '',
    databaseType: 'postgresql',
    host: '',
    port: '',
    database: '',
    username: '',
    password: ''
  })
  const [connectionType, setConnectionType] = useState('url') // 'url' or 'fields'

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <main className="connect-content">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="connect-card">
              <div className="text-center mb-4">
                <h2 className="display-5 fw-bold text-white mb-3">
                  Connect to Database
                </h2>
                <p className="lead text-light">
                  Enter your database connection details to generate ERD diagrams
                </p>
              </div>

              <form onSubmit={handleSubmit} className="connect-form">
                {/* Connection Type Toggle */}
                <div className="connection-toggle mb-4">
                  <div className="btn-group w-100" role="group">
                    <input
                      type="radio"
                      className="btn-check"
                      name="connectionType"
                      id="urlType"
                      checked={connectionType === 'url'}
                      onChange={() => setConnectionType('url')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="urlType">
                      <i className="bi bi-link-45deg me-2"></i>
                      Connection String
                    </label>

                    <input
                      type="radio"
                      className="btn-check"
                      name="connectionType"
                      id="fieldsType"
                      checked={connectionType === 'fields'}
                      onChange={() => setConnectionType('fields')}
                    />
                    <label className="btn btn-outline-primary" htmlFor="fieldsType">
                      <i className="bi bi-gear me-2"></i>
                      Individual Fields
                    </label>
                  </div>
                </div>

                {connectionType === 'url' ? (
                  /* Connection String Input */
                  <div className="mb-4">
                    <label htmlFor="dbUrl" className="form-label text-light fw-bold">
                      <i className="bi bi-link me-2"></i>
                      Database Connection String
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="dbUrl"
                      name="dbUrl"
                      value={formData.dbUrl}
                      onChange={handleInputChange}
                      placeholder="postgresql://username:password@host:port/database"
                      required
                    />
                    <div className="form-text text-muted">
                      Example: postgresql://user:pass@localhost:5432/mydb
                    </div>
                  </div>
                ) : (
                  /* Individual Fields */
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="databaseType" className="form-label text-light fw-bold">
                        <i className="bi bi-database me-2"></i>
                        Database Type
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="databaseType"
                        name="databaseType"
                        value={formData.databaseType}
                        onChange={handleInputChange}
                      >
                        <option value="postgresql">PostgreSQL</option>
                        <option value="mysql">MySQL</option>
                        <option value="sqlserver">SQL Server</option>
                        <option value="oracle">Oracle</option>
                        <option value="sqlite">SQLite</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="host" className="form-label text-light fw-bold">
                        <i className="bi bi-hdd-network me-2"></i>
                        Host
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="host"
                        name="host"
                        value={formData.host}
                        onChange={handleInputChange}
                        placeholder="localhost"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="port" className="form-label text-light fw-bold">
                        <i className="bi bi-123 me-2"></i>
                        Port
                      </label>
                      <input
                        type="number"
                        className="form-control form-control-lg"
                        id="port"
                        name="port"
                        value={formData.port}
                        onChange={handleInputChange}
                        placeholder="5432"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="database" className="form-label text-light fw-bold">
                        <i className="bi bi-folder me-2"></i>
                        Database Name
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="database"
                        name="database"
                        value={formData.database}
                        onChange={handleInputChange}
                        placeholder="mydatabase"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="username" className="form-label text-light fw-bold">
                        <i className="bi bi-person me-2"></i>
                        Username
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        placeholder="username"
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="password" className="form-label text-light fw-bold">
                        <i className="bi bi-lock me-2"></i>
                        Password
                      </label>
                      <input
                        type="password"
                        className="form-control form-control-lg"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="password"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="d-flex gap-3 mt-5">
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-lg px-4"
                    onClick={handleBack}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-5 flex-grow-1"
                  >
                    <i className="bi bi-lightning me-2"></i>
                    Generate ERD
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Connect