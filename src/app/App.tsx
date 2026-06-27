import { BattlePanel } from "../components/BattlePanel";
import "./styles.css";

function App() {
  return (
    <div className="app">
      <header className="site-header">
        <div className="brand-mark" aria-hidden="true"><span>T</span></div>
        <div>
          <h1 className="app-title">Typeblade</h1>
          <p className="app-subtitle">Words are your weapon</p>
        </div>
      </header>
      <BattlePanel />
      <footer>Built for quick battles. Your typing never leaves this device.</footer>
    </div>
  );
}

export default App;
