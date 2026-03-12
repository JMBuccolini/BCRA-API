export function CardPaquete({ data }) {
  const formatMoney = (val) => {
    if (!val) return '-'
    const num = parseFloat(val.replace(',', '.'))
    return isNaN(num) ? val : `$${num.toLocaleString('es-AR')}`
  }

  return (
    <div className="card">
      <div className="card-header">
        <span className="card-entity">{data.entidad}</span>
        <span className="card-date">{data.fechaInformacion}</span>
      </div>
      <div className="card-title">{data.nombreCompleto || data.nombreCorto}</div>
      {data.segmento && <span className="tag">{data.segmento}</span>}
      <div className="card-fields">
        <div className="card-field">
          <span className="field-label">Com. Mantenimiento</span>
          <span className="field-value highlight">{formatMoney(data.comisionMantenimiento)}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Ingreso mínimo</span>
          <span className="field-value">{formatMoney(data.ingresoMinimo)}</span>
        </div>
        {data.beneficiarios && (
          <div className="card-field full">
            <span className="field-label">Beneficiarios</span>
            <span className="field-value small">{data.beneficiarios}</span>
          </div>
        )}
        {data.productosIntegrantes && (
          <div className="card-field full">
            <span className="field-label">Productos incluidos</span>
            <span className="field-value small">{data.productosIntegrantes}</span>
          </div>
        )}
        <div className="card-field">
          <span className="field-label">Antigüedad laboral</span>
          <span className="field-value">{data.antiguedadLaboral ? `${data.antiguedadLaboral} meses` : '-'}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Territorio</span>
          <span className="field-value small">{data.territorio || '-'}</span>
        </div>
      </div>
    </div>
  )
}
