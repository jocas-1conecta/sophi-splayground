import './LoadingScreen.css';

export default function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-screen-content">
        <div className="loading-orbs">
          <span className="loading-orb loading-orb-1" />
          <span className="loading-orb loading-orb-2" />
          <span className="loading-orb loading-orb-3" />
        </div>
        <h1 className="loading-screen-title text-gradient">Sophi's Playground</h1>
        <p className="loading-screen-subtitle">Cargando la diversión...</p>
      </div>
    </div>
  );
}
