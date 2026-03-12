import { useState, useEffect, useCallback } from 'react'
import {
  metricsLogin,
  fetchMetricsSummary,
  fetchMetricsTopRoutes,
  fetchMetricsDaily,
  fetchMetricsHourly,
  fetchMetricsDevices,
  fetchMetricsReferers,
  fetchMetricsRecent,
} from '../api'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'

const TOKEN_KEY = 'metrics_token'

function LoginForm({ onLogin }) {
  const [user, setUser] = useState('')
  const [pass, setPass] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const { token } = await metricsLogin(user, pass)
      sessionStorage.setItem(TOKEN_KEY, token)
      onLogin(token)
    } catch {
      setError('Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="metrics-login-container">
      <form className="metrics-login-form" onSubmit={handleSubmit}>
        <div className="metrics-login-icon">&#128274;</div>
        <h2>Acceso a Métricas</h2>
        <p>Ingresá tus credenciales de administrador</p>
        {error && <div className="metrics-error">{error}</div>}
        <input
          type="text"
          placeholder="Usuario"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          className="filter-input"
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          className="filter-input"
          autoComplete="current-password"
        />
        <button type="submit" className="retry-btn" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  )
}

const COLORS = ['#0a4d8c', '#00b4d8', '#38a169', '#d69e2e']

function SummaryCards({ summary }) {
  const cards = [
    { label: 'Hoy', value: summary.today },
    { label: 'Últimos 7 días', value: summary.last7Days },
    { label: 'Últimos 30 días', value: summary.last30Days },
    { label: 'Total', value: summary.total },
  ]
  return (
    <div className="metrics-summary-grid">
      {cards.map((c) => (
        <div key={c.label} className="metrics-summary-card">
          <div className="metrics-summary-value">{c.value.toLocaleString('es-AR')}</div>
          <div className="metrics-summary-label">{c.label}</div>
        </div>
      ))}
    </div>
  )
}

function DailyChart({ data }) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' }),
  }))
  return (
    <div className="metrics-chart-container">
      <h3>Visitas diarias (últimos 30 días)</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={formatted}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Bar dataKey="visits" fill="#0a4d8c" radius={[4, 4, 0, 0]} name="Visitas" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function HourlyChart({ data }) {
  const full = Array.from({ length: 24 }, (_, i) => {
    const found = data.find((d) => d.hour === i)
    return { hour: `${String(i).padStart(2, '0')}:00`, visits: found ? found.visits : 0 }
  })
  return (
    <div className="metrics-chart-container">
      <h3>Distribución horaria (últimos 7 días)</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={full}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip />
          <Line type="monotone" dataKey="visits" stroke="#00b4d8" strokeWidth={2} dot={false} name="Visitas" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function DevicesChart({ data }) {
  const pieData = Object.entries(data)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({
      name: name === 'mobile' ? 'Móvil' : name === 'desktop' ? 'Escritorio' : name === 'bot' ? 'Bot' : 'Otro',
      value,
    }))
  return (
    <div className="metrics-chart-container">
      <h3>Dispositivos</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
            {pieData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

function TopRoutesTable({ data }) {
  return (
    <div className="metrics-chart-container">
      <h3>Rutas más visitadas</h3>
      <div className="metrics-table-wrapper">
        <table className="metrics-table">
          <thead>
            <tr><th>Ruta</th><th>Visitas</th></tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.path}>
                <td><code>{r.path}</code></td>
                <td>{r.hits.toLocaleString('es-AR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ReferersList({ data }) {
  if (!data.length) return null
  return (
    <div className="metrics-chart-container">
      <h3>Referers</h3>
      <div className="metrics-table-wrapper">
        <table className="metrics-table">
          <thead>
            <tr><th>Origen</th><th>Visitas</th></tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.referer}>
                <td style={{ wordBreak: 'break-all' }}>{r.referer}</td>
                <td>{r.count.toLocaleString('es-AR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function RecentTable({ data }) {
  return (
    <div className="metrics-chart-container">
      <h3>Últimas peticiones</h3>
      <div className="metrics-table-wrapper">
        <table className="metrics-table metrics-table-sm">
          <thead>
            <tr><th>Hora</th><th>Método</th><th>Ruta</th><th>Status</th><th>IP</th></tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={i}>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(r.created_at + 'Z').toLocaleString('es-AR')}</td>
                <td><span className={`method-badge method-${r.method.toLowerCase()}`}>{r.method}</span></td>
                <td><code>{r.path}</code></td>
                <td>{r.status_code}</td>
                <td style={{ fontSize: '0.75rem' }}>{r.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function MetricsDashboard({ onBack }) {
  const [token, setToken] = useState(() => sessionStorage.getItem(TOKEN_KEY))
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const loadData = useCallback(async (t) => {
    setLoading(true)
    setError(null)
    try {
      const [summary, topRoutes, daily, hourly, devices, referers, recent] = await Promise.all([
        fetchMetricsSummary(t),
        fetchMetricsTopRoutes(t),
        fetchMetricsDaily(t),
        fetchMetricsHourly(t),
        fetchMetricsDevices(t),
        fetchMetricsReferers(t),
        fetchMetricsRecent(t),
      ])
      setData({ summary, topRoutes, daily, hourly, devices, referers, recent })
    } catch (err) {
      if (err.message === 'UNAUTHORIZED') {
        sessionStorage.removeItem(TOKEN_KEY)
        setToken(null)
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) loadData(token)
  }, [token, loadData])

  const handleLogin = (t) => setToken(t)
  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setData(null)
    onBack()
  }

  if (!token) {
    return (
      <div>
        <button className="metrics-back-btn" onClick={onBack}>&larr; Volver al sitio</button>
        <LoginForm onLogin={handleLogin} />
      </div>
    )
  }

  return (
    <div className="metrics-dashboard">
      <div className="metrics-header">
        <div>
          <button className="metrics-back-btn" onClick={onBack}>&larr; Volver al sitio</button>
          <h2>Dashboard de Métricas</h2>
        </div>
        <div className="metrics-header-actions">
          <button className="retry-btn" onClick={() => loadData(token)}>Actualizar</button>
          <button className="metrics-logout-btn" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner" />
          <p className="loading-text">Cargando métricas...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={() => loadData(token)}>Reintentar</button>
        </div>
      )}

      {data && !loading && (
        <>
          <SummaryCards summary={data.summary} />
          <div className="metrics-charts-grid">
            <DailyChart data={data.daily} />
            <HourlyChart data={data.hourly} />
          </div>
          <div className="metrics-charts-grid">
            <TopRoutesTable data={data.topRoutes} />
            <DevicesChart data={data.devices} />
          </div>
          <ReferersList data={data.referers} />
          <RecentTable data={data.recent} />
        </>
      )}
    </div>
  )
}
