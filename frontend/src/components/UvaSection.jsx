import { useState, useEffect } from 'react'
import { fetchUvaEvolucion } from '../api'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const PERIOD_OPTIONS = [
  { meses: 3, label: '3 meses' },
  { meses: 6, label: '6 meses' },
  { meses: 12, label: '1 año' },
  { meses: 24, label: '2 años' },
]

function formatDate(fecha) {
  const d = new Date(fecha + 'T00:00:00')
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

function formatValue(val) {
  return val?.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function UvaSection() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [meses, setMeses] = useState(12)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchUvaEvolucion(meses)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [meses])

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p className="loading-text">Cargando datos UVA...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>Error al cargar datos UVA</h3>
        <p>{error}</p>
        <button className="retry-btn" onClick={() => setMeses(m => m)}>Reintentar</button>
      </div>
    )
  }

  const chartData = (data?.data || []).map((d) => ({
    fecha: d.fecha,
    label: formatDate(d.fecha),
    valor: d.valor,
  }))

  const variacion = chartData.length >= 2
    ? ((chartData[chartData.length - 1].valor - chartData[0].valor) / chartData[0].valor * 100).toFixed(2)
    : null

  return (
    <div className="uva-section">
      <div className="uva-header">
        <div className="uva-current">
          <div className="uva-current-label">Valor UVA actual</div>
          <div className="uva-current-value">${formatValue(data?.valorActual)}</div>
          <div className="uva-current-date">Al {data?.fechaActual}</div>
        </div>
        {variacion && (
          <div className={`uva-variation ${Number(variacion) > 0 ? 'up' : 'down'}`}>
            {Number(variacion) > 0 ? '+' : ''}{variacion}%
            <span className="uva-variation-label">en {PERIOD_OPTIONS.find(p => p.meses === meses)?.label}</span>
          </div>
        )}
      </div>

      <div className="uva-periods">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.meses}
            className={`sort-badge ${meses === opt.meses ? 'active' : ''}`}
            onClick={() => setMeses(opt.meses)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className="uva-chart">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: '#718096' }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#718096' }}
              domain={['dataMin - 20', 'dataMax + 20']}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip
              formatter={(value) => [`$${formatValue(value)}`, 'Valor UVA']}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fecha || ''}
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0,0,0,0.07)',
              }}
            />
            <Line
              type="monotone"
              dataKey="valor"
              stroke="#0a4d8c"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5, fill: '#0a4d8c', stroke: '#fff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
