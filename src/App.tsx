import { useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { getPosition } from './shared-menu/shared-menu.utils';
import { MyCustomMenu } from './MyCustomMenu';
import { useSharedMenu } from './shared-menu/shared-menu.hooks';
import { MyCustomData, MyCustomDataContextMenuCtx } from './types';

function App() {
  const { show: show1, updateConfig: updateConfig1 } = useSharedMenu<MyCustomData>('menu-1', MyCustomDataContextMenuCtx);
  const { show: show2 } = useSharedMenu<MyCustomData>('menu-2', MyCustomDataContextMenuCtx);
  const { show: show3, isActive: isActive3 } = useSharedMenu<MyCustomData>('menu-3', MyCustomDataContextMenuCtx);

  useEffect(() => {
    updateConfig1({
      customProps: {
        userId: '1234',
      },
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
          >
            Hover me!
          </button>

          <MyCustomMenu id="menu-1" />
          <MyCustomMenu id="menu-2" />
          <MyCustomMenu id="menu-3" hideOnLeave />
        </div>
      </header>
    </div>
  );
}

export default App;
