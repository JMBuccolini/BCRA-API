import { useState, useEffect } from 'react'
import { fetchNoticias } from '../api'

function timeAgo(fecha) {
  const now = new Date()
  const then = new Date(fecha)
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'Hace un momento'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hs`
  return `Hace ${Math.floor(diff / 86400)} días`
}

const FUENTE_COLORS = {
  'Ámbito Financiero': '#e53e3e',
  'El Cronista': '#2b6cb0',
  'iProfesional': '#38a169',
}

export function NoticiasSection() {
  const [noticias, setNoticias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fuenteFilter, setFuenteFilter] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchNoticias()
      .then((res) => setNoticias(res.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p className="loading-text">Cargando noticias...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error al cargar noticias</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    )
  }

  const fuentes = [...new Set(noticias.map((n) => n.fuente))]
  const filtered = fuenteFilter ? noticias.filter((n) => n.fuente === fuenteFilter) : noticias

  return (
    <div className="noticias-section">
      <div className="noticias-filters">
        <button
          className={`sort-badge ${!fuenteFilter ? 'active' : ''}`}
          onClick={() => setFuenteFilter(null)}
        >
          Todas ({noticias.length})
        </button>
        {fuentes.map((f) => (
          <button
            key={f}
            className={`sort-badge ${fuenteFilter === f ? 'active' : ''}`}
            onClick={() => setFuenteFilter(fuenteFilter === f ? null : f)}
          >
            {f} ({noticias.filter((n) => n.fuente === f).length})
          </button>
        ))}
      </div>

      <div className="noticias-list">
        {filtered.map((noticia, idx) => (
          <a
            key={idx}
            href={noticia.link}
            target="_blank"
            rel="noopener noreferrer"
            className="noticia-card"
          >
            <div className="noticia-header">
              <span
                className="noticia-fuente"
                style={{ color: FUENTE_COLORS[noticia.fuente] || '#4a5568' }}
              >
                {noticia.fuente}
              </span>
              <span className="noticia-time">{timeAgo(noticia.fecha)}</span>
            </div>
            <h3 className="noticia-titulo">{noticia.titulo}</h3>
            {noticia.descripcion && (
              <p className="noticia-desc">{noticia.descripcion}</p>
            )}
          </a>
        ))}
      </div>
    </div>
  )
}
