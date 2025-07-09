import { useNavigate } from 'react-router-dom'

function Home() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    navigate('/connect')
  }

  return (
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
            <button
              className="btn btn-primary btn-lg px-5 py-3 fw-bold"
              onClick={handleGetStarted}
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default Home