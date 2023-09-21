import DroneScene from "./Drones/DroneScene";
import './App.scss';
import { useEffect } from "react";

function App() {

  useEffect(() => {
    const worker = new Worker("src/test-worker.ts");
    worker.postMessage("message");
    return () => worker.terminate();
  }, [])

  return (
    <div className='App'>
      <DroneScene />
    </div>
  )
}

export default App
