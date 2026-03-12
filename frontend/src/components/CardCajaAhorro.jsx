import { BranchButton } from './BranchButton'

export function CardCajaAhorro({ data, userLocation }) {
  return (
    <div className="card">
      <div className="card-header">
        <span className="card-entity">{data.entidad}</span>
        <span className="card-date">{data.fechaInformacion}</span>
      </div>
      <div className="card-fields">
        <div className="card-field full">
          <span className="field-label">Proceso simplificado de apertura</span>
          <span className="field-value">
            <span className={`tag ${data.procesoSimplificado?.toUpperCase() === 'SI' ? 'green' : 'orange'}`}>
              {data.procesoSimplificado || 'Sin información'}
            </span>
          </span>
        </div>
        <div className="card-field">
          <span className="field-label">Código entidad</span>
          <span className="field-value">{data.codigoEntidad}</span>
        </div>
      </div>
      <BranchButton entidad={data.entidad} userLocation={userLocation} />
    </div>
  )
}
