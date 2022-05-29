import { useContext, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { getPosition } from './shared-menu/shared-menu.utils';
import { MyCustomMenu } from './MyCustomMenu';
import { MyCustomDataContextMenuCtx } from './types';

function App() {
  const { useSharedMenu } = useContext(MyCustomDataContextMenuCtx);
  const { 
    show: show1, 
    addListener: addListener1, 
    updateCustomProps: updateCustomProps1,
  } = useSharedMenu('menu-1');

  const { show: show2 } = useSharedMenu('menu-2');
  
  const { 
    show: show3, 
    isActive: isActive3,
    addListener: addListener3, 
  } = useSharedMenu('menu-3');

  useEffect(() => {
    const unsubscribe1 = addListener1('onShow', () => {
      if (window.confirm('show logout?')) {
        updateCustomProps1({
          userId: '1234',
        });
      } else {
        updateCustomProps1({
          userId: null,
        });
      }
    }, false);

    const unsubscribe3 = addListener3('onHide', () => {
      console.info('Menu 3 was hidden 😱');
    }, false);

    return function cleanup() {
      unsubscribe1();
      unsubscribe3();
    }
  }, [
    updateCustomProps1,
    addListener1,
    addListener3,
  ]);

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        
        <div style={{ display: 'flex', gap: 15 }}>
          <button 
            type="button" 
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
                position: {
                  x: e.clientX,
                  y: e.clientY,
                },
              });
            }}
          >
            Right click me!
          </button>

          <button 
            type="button" 
            onMouseEnter={e => {
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
