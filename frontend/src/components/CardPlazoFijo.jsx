export function CardPlazoFijo({ data }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-entity">{data.entidad}</span>
        <span className="card-date">{data.fechaInformacion}</span>
      </div>
      <div className="card-title">{data.nombreCompleto || data.nombreCorto}</div>
      <div className="card-fields">
        <div className="card-field">
          <span className="field-label">TEA Mínima</span>
          <span className="field-value highlight">{data.tasaEfectivaAnual ? `${data.tasaEfectivaAnual}%` : '-'}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Denominación</span>
          <span className="field-value">{data.denominacion || '-'}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Monto mínimo</span>
          <span className="field-value">{data.montoMinimo ? `$${Number(data.montoMinimo).toLocaleString('es-AR')}` : '-'}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Plazo mínimo</span>
          <span className="field-value">{data.plazoMinimo || '-'}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Canal</span>
          <span className="field-value small">{data.canalConstitucion || '-'}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Territorio</span>
          <span className="field-value small">{data.territorio || '-'}</span>
        </div>
      </div>
    </div>
  )
}
