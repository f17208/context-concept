import { useContext, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { SharedMenuCtx } from './shared-menu';
import { getPosition } from './shared-menu/shared-menu.utils';
import { MyCustomMenu } from './MyCustomMenu';

function App() {
  const { useSharedMenu } = useContext(SharedMenuCtx);
  const { show: show1, updateConfig: updateConfig1 } = useSharedMenu('menu-1');
  const { show: show2 } = useSharedMenu('menu-2');
  const { show: show3, isActive: isActive3, hide: hide3 } = useSharedMenu('menu-3');

  useEffect(() => {
    updateConfig1({
      onHide: () => {
        alert('onHide: triggered!');
      },
      onShow: () => {
        alert('onShow: triggered!');
      },
    });
    // You don't really want to do that (update config loop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        
        <div style={{ display: 'flex', gap: 15 }}>
          <button type="button" 
            onClick={e => {
              show1({
                position: getPosition(e.target as HTMLElement, 'right'),
              });
            }}
          >
            Click me!
          </button>

          <button 
            type="button" 
            onContextMenu={e => {
              e.preventDefault();
              show2({ 
                position: getPosition(e.target as HTMLElement, 'bottom'),
              });
            }}
          >
            Right click me!
          </button>

          <button 
            type="button" 
            onMouseEnter={e => {
              e.preventDefault();
              if (isActive3) return;
              show3({ 
                position: getPosition(e.target as HTMLElement, 'bottom'),
              });
            }}
            onMouseLeave={() => hide3()}
          >
            Hover me!
          </button>

          <MyCustomMenu id="menu-1" />
          <MyCustomMenu id="menu-2" />
          <MyCustomMenu id="menu-3" />
        </div>
      </header>
    </div>
  );
}

export default App;
