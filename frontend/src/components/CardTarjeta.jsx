export function CardTarjeta({ data }) {
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
          <span className="field-label">TEA Compensatorio</span>
          <span className="field-value highlight">{data.teaCompensatorio ? `${data.teaCompensatorio}%` : '-'}</span>
        </div>
        <div className="card-field">
          <span className="field-label">TEA Adelanto</span>
          <span className="field-value">{data.teaAdelantoEfectivo ? `${data.teaAdelantoEfectivo}%` : '-'}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Com. Administración</span>
          <span className="field-value">{formatMoney(data.comisionAdministracion)}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Com. Renovación</span>
          <span className="field-value">{formatMoney(data.comisionRenovacion)}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Ingreso mínimo</span>
          <span className="field-value">{formatMoney(data.ingresoMinimo)}</span>
        </div>
        <div className="card-field">
          <span className="field-label">Antigüedad laboral</span>
          <span className="field-value">{data.antiguedadLaboral ? `${data.antiguedadLaboral} meses` : '-'}</span>
        </div>
      </div>
    </div>
  )
}
