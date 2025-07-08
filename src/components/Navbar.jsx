import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <i className="bi bi-database-fill me-2 fs-4 text-primary"></i>
          <span className="fw-bold">DB Schema Generator</span>
        </Link>
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
  )
}

export default Navbar