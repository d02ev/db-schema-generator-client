import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './App.css'

function App() {
  return (
    <div className="app-container">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <div className="navbar-brand d-flex align-items-center">
            <i className="bi bi-database-fill me-2 fs-4 text-primary"></i>
            <span className="fw-bold">DB Schema Generator</span>
          </div>
          <div className="navbar-nav ms-auto">
            <a
              href="https://github.com/d02ev/db-schema-generator-client"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link"
            >
              <i className="bi bi-github fs-4"></i>
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <h1 className="display-4 fw-bold text-white mb-4">
                Generate Beautiful ERD Diagrams
              </h1>
              <p className="lead text-light mb-5">
                Transform your database connection into stunning Entity Relationship Diagrams.
                Visualize your database schema with ease and precision.
              </p>
              <button className="btn btn-primary btn-lg px-5 py-3 fw-bold">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="footer bg-dark text-center py-4">
        <div className="container">
          <p className="text-light mb-0">
            Created with ❤️ by{' '}
            <a
              href="https://github.com/d02ev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-decoration-none fw-bold"
            >
              d02ev
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App
