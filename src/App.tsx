import './App.css';
import { MyTable } from './MyTable';

function App() {
  return (
    <div className="App">
      <header className="App-header flex flex-col gap-3">
        <MyTable id="my-table" />

        <MyTable id="my-table-2" />
      </header>
    </div>
  );
}

export default App;
