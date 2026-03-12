export function BranchButton({ entidad, userLocation }) {
  if (!userLocation) return null

  const handleClick = () => {
    const query = encodeURIComponent(`${entidad} cerca de ${userLocation}, Argentina`)
    window.open(`https://www.google.com/maps/search/${query}`, '_blank')
  }

  return (
    <button className="branch-btn" onClick={handleClick}>
      Buscar sucursal cercana
    </button>
  )
}
