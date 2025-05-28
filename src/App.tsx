import MapContainer from "./components/MapContainer"

function App() {
  const peruCenter = { lat: -9.19, lng: -75.0152 };
  return (
    <div className="h-screen w-screen">
      <MapContainer center={peruCenter} zoom={6} />
    </div>
  )
}

export default App
