import { useState, useEffect } from 'react'
import { fetchNoticias } from '../api'

function timeAgo(fecha) {
  const now = new Date()
  const then = new Date(fecha)
  const diff = Math.floor((now - then) / 1000)
  if (diff < 60) return 'Hace un momento'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hs`
  return `Hace ${Math.floor(diff / 86400)} dias`
}

const FUENTE_COLORS = {
  'Ambito Financiero': '#e53e3e',
  'El Cronista': '#2b6cb0',
  'iProfesional': '#38a169',
}

const TEMAS = [
  { id: 'trabajo', label: 'Trabajo y Empleo', keywords: ['empleo', 'emplead', 'laboral', 'trabajo', 'sueldo', 'salario', 'paritaria', 'gremio', 'sindicat', 'domestica', 'convenio colectivo', 'despido', 'indemnizac'] },
  { id: 'dolar', label: 'Dolar y Divisas', keywords: ['dolar', 'dólar', 'divisa', 'tipo de cambio', 'cepo', 'blue', 'mep', 'ccl', 'reservas', 'devaluac'] },
  { id: 'impuestos', label: 'Impuestos y Fiscal', keywords: ['impuesto', 'afip', 'arca', 'fiscal', 'iva', 'ganancias', 'monotributo', 'tribut', 'recaudac', 'contribucion'] },
  { id: 'inflacion', label: 'Inflacion y Precios', keywords: ['inflacion', 'inflación', 'precio', 'ipc', 'canasta', 'costo de vida', 'tarifas', 'tarifa', 'aumentos'] },
  { id: 'bancos', label: 'Bancos y Finanzas', keywords: ['banco', 'bcra', 'tasa', 'credito', 'crédito', 'prestamo', 'préstamo', 'plazo fijo', 'hipotecar', 'financ', 'uva'] },
  { id: 'comercio', label: 'Comercio e Industria', keywords: ['comercio', 'export', 'import', 'industria', 'pyme', 'manufactur', 'producc', 'agro', 'campo', 'soja', 'trigo'] },
  { id: 'politica', label: 'Politica Economica', keywords: ['gobierno', 'milei', 'caputo', 'congreso', 'ley', 'decreto', 'presupuesto', 'fmi', 'deuda', 'ajuste', 'reforma'] },
  { id: 'jubilaciones', label: 'Jubilaciones y ANSES', keywords: ['jubilac', 'anses', 'pension', 'pensión', 'auh', 'asignac', 'haber', 'retirad'] },
]

const TEMA_COLORS = {
  trabajo: '#805ad5',
  dolar: '#38a169',
  impuestos: '#d69e2e',
  inflacion: '#e53e3e',
  bancos: '#2b6cb0',
  comercio: '#dd6b20',
  politica: '#4a5568',
  jubilaciones: '#319795',
}

function clasificarNoticia(noticia) {
  const texto = `${noticia.titulo} ${noticia.descripcion}`.toLowerCase()
  for (const tema of TEMAS) {
    if (tema.keywords.some((kw) => texto.includes(kw))) {
      return tema.id
    }
  }
  return 'otros'
}

export function NoticiasSection() {
  const [noticias, setNoticias] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [fuenteFilter, setFuenteFilter] = useState(null)
  const [temaFilter, setTemaFilter] = useState(null)

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

  const noticiasConTema = noticias.map((n) => ({ ...n, tema: clasificarNoticia(n) }))
  const fuentes = [...new Set(noticias.map((n) => n.fuente))]

  const temasPresentes = TEMAS.filter((t) => noticiasConTema.some((n) => n.tema === t.id))
  const hayOtros = noticiasConTema.some((n) => n.tema === 'otros')

  const filtered = noticiasConTema
    .filter((n) => !fuenteFilter || n.fuente === fuenteFilter)
    .filter((n) => !temaFilter || n.tema === temaFilter)

  return (
    <div className="noticias-section">
      <div className="noticias-filter-group">
        <span className="sort-label">Fuente:</span>
        <div className="noticias-filters">
          <button
            className={`sort-badge ${!fuenteFilter ? 'active' : ''}`}
            onClick={() => setFuenteFilter(null)}
          >
            Todas
          </button>
          {fuentes.map((f) => (
            <button
              key={f}
              className={`sort-badge ${fuenteFilter === f ? 'active' : ''}`}
              onClick={() => setFuenteFilter(fuenteFilter === f ? null : f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="noticias-filter-group">
        <span className="sort-label">Tema:</span>
        <div className="noticias-filters">
          <button
            className={`sort-badge ${!temaFilter ? 'active' : ''}`}
            onClick={() => setTemaFilter(null)}
          >
            Todos
          </button>
          {temasPresentes.map((t) => {
            const count = noticiasConTema.filter((n) => n.tema === t.id && (!fuenteFilter || n.fuente === fuenteFilter)).length
            return (
              <button
                key={t.id}
                className={`sort-badge ${temaFilter === t.id ? 'active' : ''}`}
                onClick={() => setTemaFilter(temaFilter === t.id ? null : t.id)}
                style={temaFilter === t.id ? { background: TEMA_COLORS[t.id], borderColor: TEMA_COLORS[t.id] } : {}}
              >
                {t.label} ({count})
              </button>
            )
          })}
          {hayOtros && (
            <button
              className={`sort-badge ${temaFilter === 'otros' ? 'active' : ''}`}
              onClick={() => setTemaFilter(temaFilter === 'otros' ? null : 'otros')}
            >
              Otros ({noticiasConTema.filter((n) => n.tema === 'otros' && (!fuenteFilter || n.fuente === fuenteFilter)).length})
            </button>
          )}
        </div>
      </div>

      <div className="noticias-results">
        <span className="results-count">{filtered.length} noticias</span>
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
              <div className="noticia-meta">
                <span
                  className="noticia-fuente"
                  style={{ color: FUENTE_COLORS[noticia.fuente] || '#4a5568' }}
                >
                  {noticia.fuente}
                </span>
                {noticia.tema !== 'otros' && (
                  <span
                    className="noticia-tema-tag"
                    style={{ background: TEMA_COLORS[noticia.tema] || '#718096' }}
                  >
                    {TEMAS.find((t) => t.id === noticia.tema)?.label || 'Otros'}
                  </span>
                )}
              </div>
              <span className="noticia-time">{timeAgo(noticia.fecha)}</span>
            </div>
            <h3 className="noticia-titulo">{noticia.titulo}</h3>
            {noticia.descripcion && (
              <p className="noticia-desc">{noticia.descripcion}</p>
            )}
          </a>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">📰</div>
            <p>No se encontraron noticias con estos filtros.</p>
          </div>
        )}
      </div>
    </div>
  )
}
