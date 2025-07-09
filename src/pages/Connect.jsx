import { useEffect, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { connectionStringGenerator } from '../utils'
import {
  setStep,
  setConnectionType,
  setFormData,
  setTestConnectionLoading,
  setTestConnectionSuccess,
  setTestConnectionError,
  setSchemaLoading,
  setSchemaSuccess,
  setSchemaError,
  setSchemas,
  setSelectedSchema,
  setTablesLoading,
  setTablesSuccess,
  setTablesError,
  setTables,
  setSelectedTables,
  setDiagramLoading,
  setDiagramError,
  setDiagramData,
  resetForm
} from '../store'
import { testConnection, getSchema, getTables } from '../api'

const stepTitles = [
  'Connection',
  'Schema',
  'Tables'
]

const stepCount = stepTitles.length

function Connect() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const {
    step,
    connectionType,
    formData,
    testConnectionLoading,
    testConnectionSuccess,
    testConnectionError,
    schemaLoading,
    schemaSuccess,
    schemaError,
    schemas,
    selectedSchema,
    tablesLoading,
    tablesSuccess,
    tablesError,
    tables,
    selectedTables
  } = useSelector(state => state.form)

  // For animated card transitions
  const prevStep = useRef(step)
  useEffect(() => { prevStep.current = step }, [step])

  // Step 1: Test Connection
  const handleTestConnection = async () => {
    dispatch(setTestConnectionLoading(true))
    dispatch(setTestConnectionError(null))
    let dbUrlToSend = formData.dbUrl
    if (connectionType === 'fields') {
      try {
        dbUrlToSend = connectionStringGenerator(formData)
      } catch (err) {
        dispatch(setTestConnectionError(err.message))
        dispatch(setTestConnectionLoading(false))
        return
      }
    }
    const res = await testConnection(dbUrlToSend)
    if (res.success) {
      dispatch(setTestConnectionSuccess(true))
      dispatch(setStep(2))
      handleGetSchema(dbUrlToSend)
    } else {
      dispatch(setTestConnectionError(res.message))
    }
    dispatch(setTestConnectionLoading(false))
  }

  // Step 2: Get Schemas
  const handleGetSchema = async (dbUrlOverride) => {
    dispatch(setSchemaLoading(true))
    dispatch(setSchemaError(null))
    let dbUrlToSend = dbUrlOverride
    if (!dbUrlToSend) {
      dbUrlToSend = formData.dbUrl
      if (connectionType === 'fields') {
        try {
          dbUrlToSend = connectionStringGenerator(formData)
        } catch (err) {
          dispatch(setSchemaError(err.message))
          dispatch(setSchemaLoading(false))
          return
        }
      }
    }
    const res = await getSchema(dbUrlToSend)
    if (res.success && Array.isArray(res.data.schemas)) {
      dispatch(setSchemas(res.data.schemas))
      dispatch(setSchemaSuccess(true))
    } else {
      dispatch(setSchemaError(res.message))
    }
    dispatch(setSchemaLoading(false))
  }

  // Step 3: Get Tables
  const handleGetTables = async () => {
    dispatch(setTablesLoading(true))
    dispatch(setTablesError(null))
    let dbUrlToSend = formData.dbUrl
    if (connectionType === 'fields') {
      try {
        dbUrlToSend = connectionStringGenerator(formData)
      } catch (err) {
        dispatch(setTablesError(err.message))
        dispatch(setTablesLoading(false))
        return
      }
    }
    const res = await getTables(dbUrlToSend, selectedSchema)
    if (res.success && Array.isArray(res.data.tables)) {
      dispatch(setTables(res.data.tables))
      dispatch(setTablesSuccess(true))
      // Default: select all tables
      dispatch(setSelectedTables(res.data.tables.length ? [res.data.tables[0]] : []))
      dispatch(setStep(3))
    } else {
      dispatch(setTablesError(res.message))
    }
    dispatch(setTablesLoading(false))
  }

  // Step 3: Table selection
  const handleTableTagClick = (table) => {
    if (selectedTables.includes(table)) {
      if (selectedTables.length === 1) {
        alert('At least one table is required.')
        return
      }
      dispatch(setSelectedTables(selectedTables.filter(t => t !== table)))
    } else {
      dispatch(setSelectedTables([...selectedTables, table]))
    }
  }

  // Step 3: Generate ERD
  const handleGenerateERD = () => {
    // Save all state and redirect to /diagram
    navigate('/diagram')
  }

  // Back button logic
  const handleBack = () => {
    if (step === 1) {
      navigate('/')
      dispatch(resetForm())
    } else {
      dispatch(setStep(step - 1))
    }
  }

  // Progress indicator
  const renderProgress = () => (
    <div className="mb-4 d-flex align-items-center justify-content-center gap-3">
      {stepTitles.map((title, idx) => (
        <div key={title} className="d-flex align-items-center gap-2">
          <div className={`progress-step ${step === idx + 1 ? 'active' : ''} ${step > idx + 1 ? 'completed' : ''}`}></div>
          <span className={`text-light small ${step === idx + 1 ? 'fw-bold' : ''}`}>{title}</span>
          {idx < stepTitles.length - 1 && (
            <span style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
              <svg width="28" height="16" viewBox="0 0 28 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', verticalAlign: 'middle' }}>
                <path d="M2 8H26" stroke="#0d6efd" strokeWidth="2" strokeLinecap="round" />
                <path d="M20 3L26 8L20 13" stroke="#0d6efd" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
        </div>
      ))}
    </div>
  )

  // Card animation variants
  const cardVariants = {
    initial: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    animate: { x: 0, opacity: 1, transition: { type: 'spring', duration: 0.5 } },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.3 }
    })
  }

  return (
    <main className="connect-content">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {renderProgress()}
            <AnimatePresence custom={step - prevStep.current} mode="wait">
              <motion.div
                key={step}
                custom={step - prevStep.current}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="connect-card"
              >
                {/* Step 1: Connection */}
                {step === 1 && (
                  <>
                    <div className="text-center mb-4">
                      <h2 className="display-5 fw-bold text-white mb-3">
                        Connect to Database
                      </h2>
                      <p className="lead text-light">
                        Enter your database connection details to generate ERD diagrams
                      </p>
                    </div>
                    {testConnectionError && (
                      <div className="alert alert-danger" role="alert">
                        {testConnectionError}
                      </div>
                    )}
                    <form onSubmit={e => { e.preventDefault(); handleTestConnection() }} className="connect-form">
                      {/* Connection Type Toggle */}
                      <div className="connection-toggle mb-4">
                        <div className="btn-group w-100" role="group">
                          <input
                            type="radio"
                            className="btn-check"
                            name="connectionType"
                            id="urlType"
                            checked={connectionType === 'url'}
                            onChange={() => dispatch(setConnectionType('url'))}
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
                            onChange={() => dispatch(setConnectionType('fields'))}
                          />
                          <label className="btn btn-outline-primary" htmlFor="fieldsType">
                            <i className="bi bi-gear me-2"></i>
                            Individual Fields
                          </label>
                        </div>
                      </div>
                      {connectionType === 'url' ? (
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
                            onChange={e => dispatch(setFormData({ dbUrl: e.target.value }))}
                            placeholder="postgresql://username:password@host:port/database"
                            required
                          />
                          <div className="form-text text-muted">
                            Example: postgresql://user:pass@localhost:5432/mydb
                          </div>
                        </div>
                      ) : (
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
                              onChange={e => dispatch(setFormData({ databaseType: e.target.value }))}
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
                              onChange={e => dispatch(setFormData({ host: e.target.value }))}
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
                              onChange={e => dispatch(setFormData({ port: e.target.value }))}
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
                              onChange={e => dispatch(setFormData({ database: e.target.value }))}
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
                              onChange={e => dispatch(setFormData({ username: e.target.value }))}
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
                              onChange={e => dispatch(setFormData({ password: e.target.value }))}
                              placeholder="password"
                              required
                            />
                          </div>
                        </div>
                      )}
                      <div className="d-flex gap-3 mt-5">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-lg px-4"
                          onClick={handleBack}
                          disabled={testConnectionLoading}
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Back
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg px-5 flex-grow-1 d-flex align-items-center justify-content-center"
                          disabled={testConnectionLoading}
                        >
                          {testConnectionLoading ? (
                            <span className="d-flex align-items-center gap-2">
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              Testing Connection...
                            </span>
                          ) : (
                            <>
                              <i className="bi bi-plug me-2"></i>
                              Test Connection
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {/* Step 2: Schema Selection */}
                {step === 2 && (
                  <>
                    <div className="text-center mb-4">
                      <h2 className="display-5 fw-bold text-white mb-3">
                        Select Schema
                      </h2>
                      <p className="lead text-light">
                        Connection Successful! Fetching Schemas Now...
                      </p>
                    </div>
                    {schemaError && (
                      <div className="alert alert-danger" role="alert">
                        {schemaError}
                      </div>
                    )}
                    <form onSubmit={e => { e.preventDefault(); handleGetTables() }} className="connect-form">
                      <div className="mb-4">
                        <label htmlFor="schema" className="form-label text-light fw-bold">
                          <i className="bi bi-diagram-3 me-2"></i>
                          Schema
                        </label>
                        <select
                          className="form-select form-select-lg"
                          id="schema"
                          name="schema"
                          value={selectedSchema}
                          onChange={e => dispatch(setSelectedSchema(e.target.value))}
                          disabled={schemaLoading || !schemas.length}
                        >
                          <option value="">Choose Schema</option>
                          {schemas.map(schema => (
                            <option key={schema} value={schema}>{schema}</option>
                          ))}
                        </select>
                      </div>
                      <div className="d-flex gap-3 mt-5">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-lg px-4"
                          onClick={handleBack}
                          disabled={schemaLoading}
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Back
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg px-5 flex-grow-1 d-flex align-items-center justify-content-center"
                          disabled={schemaLoading || !selectedSchema}
                        >
                          {schemaLoading ? (
                            <span className="d-flex align-items-center gap-2">
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              Get Tables
                            </span>
                          ) : (
                            <>
                              <i className="bi bi-table me-2"></i>
                              Get Tables
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}

                {/* Step 3: Table Selection */}
                {step === 3 && (
                  <>
                    <div className="text-center mb-4">
                      <h2 className="display-5 fw-bold text-white mb-3">
                        Select Tables
                      </h2>
                      <p className="lead text-light">
                        Choose the tables you want to include in your ERD.
                      </p>
                    </div>
                    {tablesError && (
                      <div className="alert alert-danger" role="alert">
                        {tablesError}
                      </div>
                    )}
                    <form onSubmit={e => { e.preventDefault(); handleGenerateERD() }} className="connect-form">
                      <div className="mb-4">
                        <label className="form-label text-light fw-bold">
                          <i className="bi bi-grid-3x3-gap me-2"></i>
                          Tables
                        </label>
                        <div className="d-flex flex-wrap gap-2">
                          {tables.map(table => {
                            const selected = selectedTables.includes(table)
                            const color = selected ? `var(--primary-color)` : '#222';
                            return (
                              <span
                                key={table}
                                className={`badge rounded-pill px-4 py-2 table-tag ${selected ? 'selected' : ''}`}
                                style={{
                                  background: color,
                                  color: selected ? '#fff' : '#aaa',
                                  cursor: 'pointer',
                                  fontWeight: 600,
                                  fontSize: '1rem',
                                  border: selected ? '2px solid #fff' : '1px solid #444',
                                  boxShadow: selected ? '0 2px 8px rgba(13,110,253,0.2)' : 'none',
                                  transition: 'all 0.2s',
                                }}
                                onClick={() => handleTableTagClick(table)}
                              >
                                {table}
                                {selected && selectedTables.length > 1 && (
                                  <i className="bi bi-x ms-2" style={{ fontSize: '1rem' }}></i>
                                )}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                      <div className="d-flex gap-3 mt-5">
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-lg px-4"
                          onClick={handleBack}
                          disabled={tablesLoading}
                        >
                          <i className="bi bi-arrow-left me-2"></i>
                          Back
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary btn-lg px-5 flex-grow-1 d-flex align-items-center justify-content-center"
                          disabled={tablesLoading || selectedTables.length === 0}
                        >
                          {tablesLoading ? (
                            <span className="d-flex align-items-center gap-2">
                              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                              Generate ERD
                            </span>
                          ) : (
                            <>
                              <i className="bi bi-diagram-3 me-2"></i>
                              Generate ERD
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Connect