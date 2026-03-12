import { BranchButton } from './BranchButton'

export function CardPlazoFijo({ data, isBest, bestLabel, userLocation }) {
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
      <BranchButton entidad={data.entidad} userLocation={userLocation} />
    </div>
  )
}
