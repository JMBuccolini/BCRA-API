import { useState, useEffect, useCallback } from 'react'
import './App.css'
import { fetchCategory } from './api'
import { CardPlazoFijo } from './components/CardPlazoFijo'
import { CardTarjeta } from './components/CardTarjeta'
import { CardPrestamo } from './components/CardPrestamo'
import { CardPaquete } from './components/CardPaquete'
import { CardCajaAhorro } from './components/CardCajaAhorro'
import { CardHipotecario } from './components/CardHipotecario'
import { CardPrendario } from './components/CardPrendario'

const CATEGORIES = [
  { id: 'plazosFijos', nombre: 'Plazos Fijos', icon: '📊' },
  { id: 'tarjetas', nombre: 'Tarjetas de Crédito', icon: '💳' },
  { id: 'personales', nombre: 'Préstamos Personales', icon: '💰' },
  { id: 'hipotecarios', nombre: 'Hipotecarios', icon: '🏠' },
  { id: 'prendarios', nombre: 'Prendarios', icon: '🚗' },
  { id: 'paquetes', nombre: 'Paquetes', icon: '📦' },
  { id: 'cajasDeAhorro', nombre: 'Cajas de Ahorro', icon: '🏦' },
]

const CARD_COMPONENTS = {
  plazosFijos: CardPlazoFijo,
  tarjetas: CardTarjeta,
  personales: CardPrestamo,
  hipotecarios: CardHipotecario,
  prendarios: CardPrendario,
  paquetes: CardPaquete,
  cajasDeAhorro: CardCajaAhorro,
}

const PAGE_SIZE = 50

const parseNum = (val) => {
  if (!val) return null
  const num = parseFloat(String(val).replace(',', '.'))
  return isNaN(num) ? null : num
}

const BEST_CRITERIA = {
  plazosFijos: { field: 'tasaEfectivaAnual', mode: 'max', label: 'Mejor tasa' },
  tarjetas: { field: 'teaCompensatorio', mode: 'min', label: 'Más económica' },
  personales: { field: 'cfteaMaximo', mode: 'min', label: 'Más económico' },
  hipotecarios: { field: 'cfteaMaximo', mode: 'min', label: 'Más económico' },
  prendarios: { field: 'cfteaMaximo', mode: 'min', label: 'Más económico' },
  paquetes: { field: 'comisionMantenimiento', mode: 'min', label: 'Más económico' },
}

const SORT_OPTIONS = {
  plazosFijos: [
    { field: 'tasaEfectivaAnual', dir: 'desc', label: 'Mayor tasa' },
    { field: 'tasaEfectivaAnual', dir: 'asc', label: 'Menor tasa' },
    { field: 'montoMinimo', dir: 'asc', label: 'Menor monto mínimo' },
    { field: 'montoMinimo', dir: 'desc', label: 'Mayor monto mínimo' },
  ],
  tarjetas: [
    { field: 'teaCompensatorio', dir: 'asc', label: 'Menor TEA' },
    { field: 'teaCompensatorio', dir: 'desc', label: 'Mayor TEA' },
    { field: 'comisionAdministracion', dir: 'asc', label: 'Menor comisión' },
    { field: 'ingresoMinimo', dir: 'asc', label: 'Menor ingreso requerido' },
  ],
  personales: [
    { field: 'cfteaMaximo', dir: 'asc', label: 'Menor CFTEA' },
    { field: 'teaMaxima', dir: 'asc', label: 'Menor TEA' },
    { field: 'montoMaximo', dir: 'desc', label: 'Mayor monto' },
    { field: 'plazoMaximo', dir: 'desc', label: 'Mayor plazo' },
  ],
  hipotecarios: [
    { field: 'cfteaMaximo', dir: 'asc', label: 'Menor CFTEA' },
    { field: 'teaMaxima', dir: 'asc', label: 'Menor TEA' },
    { field: 'montoMaximo', dir: 'desc', label: 'Mayor monto' },
    { field: 'plazoMaximo', dir: 'desc', label: 'Mayor plazo' },
  ],
  prendarios: [
    { field: 'cfteaMaximo', dir: 'asc', label: 'Menor CFTEA' },
    { field: 'teaMaxima', dir: 'asc', label: 'Menor TEA' },
    { field: 'montoMaximo', dir: 'desc', label: 'Mayor monto' },
    { field: 'plazoMaximo', dir: 'desc', label: 'Mayor plazo' },
  ],
  paquetes: [
    { field: 'comisionMantenimiento', dir: 'asc', label: 'Menor comisión' },
    { field: 'comisionMantenimiento', dir: 'desc', label: 'Mayor comisión' },
    { field: 'ingresoMinimo', dir: 'asc', label: 'Menor ingreso requerido' },
  ],
}

function sortData(items, sortOption) {
  if (!sortOption) return items
  return [...items].sort((a, b) => {
    const valA = parseNum(a[sortOption.field])
    const valB = parseNum(b[sortOption.field])
    if (valA === null && valB === null) return 0
    if (valA === null) return 1
    if (valB === null) return -1
    return sortOption.dir === 'asc' ? valA - valB : valB - valA
  })
}

function findBestItem(items, category) {
  const criteria = BEST_CRITERIA[category]
  if (!criteria || items.length === 0) return null
  let best = null
  let bestVal = null
  for (const item of items) {
    const val = parseNum(item[criteria.field])
    if (val === null || val === 0) continue
    if (bestVal === null || (criteria.mode === 'min' ? val < bestVal : val > bestVal)) {
      bestVal = val
      best = item
    }
  }
  return best
}

function App() {
  const [activeCategory, setActiveCategory] = useState('plazosFijos')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [activeSort, setActiveSort] = useState(null)

  const loadData = useCallback(async (category) => {
    setLoading(true)
    setError(null)
    setVisibleCount(PAGE_SIZE)
    try {
      const result = await fetchCategory(category)
      setData(result.data || [])
    } catch (err) {
      setError(err.message)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData(activeCategory)
  }, [activeCategory, loadData])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [searchTerm])

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId)
    setSearchTerm('')
    setActiveSort(null)
  }

  const filteredData = data.filter((item) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return Object.values(item).some((val) =>
      String(val).toLowerCase().includes(search)
    )
  })

  const bestItem = findBestItem(filteredData, activeCategory)
  const sorted = activeSort ? sortData(filteredData, activeSort) : filteredData
  const sortedData = !activeSort && bestItem
    ? [bestItem, ...sorted.filter((item) => item !== bestItem)]
    : sorted
  const visibleData = sortedData.slice(0, visibleCount)
  const hasMore = visibleCount < sortedData.length
  const CardComponent = CARD_COMPONENTS[activeCategory]
  const bestLabel = BEST_CRITERIA[activeCategory]?.label
  const sortOptions = SORT_OPTIONS[activeCategory] || []

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div className="header-brand">
            <div className="header-logo">AR</div>
            <div>
              <h1>BCRA Transparencia</h1>
              <div className="header-subtitle">Productos y Servicios Financieros</div>
            </div>
          </div>
          <div className="header-badge">Datos actualizados diariamente</div>
        </div>
      </header>

      <main className="main">
        <div className="hero">
          <h2>Explorá productos financieros de Argentina</h2>
          <p>
            Datos oficiales del Banco Central de la República Argentina.
            Compará tasas, comisiones y condiciones de todas las entidades financieras.
          </p>
        </div>

        <nav className="category-nav">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              {cat.icon} {cat.nombre}
            </button>
          ))}
        </nav>

        <div className="filters">
          <input
            type="text"
            className="filter-input"
            placeholder="Buscar por entidad, producto, denominación..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {sortOptions.length > 0 && (
          <div className="sort-bar">
            <span className="sort-label">Ordenar por:</span>
            {sortOptions.map((opt, idx) => (
              <button
                key={idx}
                className={`sort-badge ${activeSort === opt ? 'active' : ''}`}
                onClick={() => setActiveSort(activeSort === opt ? null : opt)}
              >
                {opt.dir === 'asc' ? '\u2191' : '\u2193'} {opt.label}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="loading">
            <div className="spinner" />
            <p className="loading-text">Cargando datos del BCRA...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <h3>Error al cargar datos</h3>
            <p>{error}</p>
            <button className="retry-btn" onClick={() => loadData(activeCategory)}>
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="results-info">
              <span className="results-count">
                Mostrando <strong>{visibleData.length}</strong> de <strong>{filteredData.length}</strong> resultados
              </span>
            </div>

            {filteredData.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <p>No se encontraron resultados para tu búsqueda.</p>
              </div>
            ) : (
              <>
                <div className="data-grid">
                  {visibleData.map((item, idx) => (
                    <CardComponent
                      key={idx}
                      data={item}
                      isBest={item === bestItem}
                      bestLabel={bestLabel}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button
                      className="retry-btn"
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    >
                      Cargar más resultados ({filteredData.length - visibleCount} restantes)
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </main>

      <footer className="footer">
        Datos provistos por el{' '}
        <a href="https://www.bcra.gob.ar/BCRAyVos/Regimen_de_transparencia.asp" target="_blank" rel="noopener noreferrer">
          BCRA - Régimen de Transparencia
        </a>
        . Información actualizada a las 11:00 y 19:00 hs en días hábiles.
      </footer>
    </div>
  )
}

export default App
