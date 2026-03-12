export function CardHipotecario({ data, isBest, bestLabel }) {
  const formatMoney = (val) => {
    if (!val) return '-'
    const num = parseFloat(val.replace(',', '.'))
    return isNaN(num) ? val : `$${num.toLocaleString('es-AR')}`
  }

  return (
    <div className={`card${isBest ? ' card-best' : ''}`}>
      {isBest && <div className="best-badge">{bestLabel}</div>}
      <div className="card-header">
        <span className="card-entity">{data.entidad}</span>
        <span className="card-date">{data.fechaInformacion}</span>
      </div>
      <div className="card-title">{data.nombreCompleto || data.nombreCorto}</div>
      <div className="card-fields">
        <div className="card-field">
          <span className="field-label">TEA Máxima</span>
          <span className="field-value highlight">{data.teaMaxima ? `${data.teaMaxima}%` : '-'}</span>
        </div>
        <div className="card-field">
          <span className="field-label">CFTEA Máximo</span>
          <span className="field-value highlight">{data.cfteaMaximo ? `${data.cfteaMaximo}%` : '-'}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Monto máximo</span>
          <span className="field-value">{formatMoney(data.montoMaximo)}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Plazo máximo</span>
          <span className="field-value">{data.plazoMaximo || '-'}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Denominación</span>
          <span className="field-value">{data.denominacion || '-'}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Tipo de tasa</span>
          <span className="field-value">
            <span className={`tag ${data.tipoTasa?.toLowerCase().includes('fija') ? 'green' : 'orange'}`}>
              {data.tipoTasa || '-'}
            </span>
          </span>
        </div>
        {data.destinoFondos && (
          <div className="card-field full">
            <span className="field-label">Destino</span>
            <span className="field-value small">{data.destinoFondos}</span>
          </div>
        )}
        <div className="card-field">
          <span className="field-label">Ingreso mínimo</span>
          <span className="field-value">{formatMoney(data.ingresoMinimo)}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Cuota c/$100.000</span>
          <span className="field-value">{formatMoney(data.cuotaInicial)}</span>
        </div>
      </div>
    </div>
  )
}
