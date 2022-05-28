// this should be moved in a separate file/folder, just quick-prototyping now, ok?
export function getPosition(
  target: HTMLElement,
  align: 'right' | 'bottom',
) {
    let x, y;
    switch (align) {
      case 'right': // exactly to the right of the target element
        x = target.offsetLeft + target.offsetWidth;
        y = target.offsetTop;
        break;
      case 'bottom': // exactly below the target element
        x = target.offsetLeft;
        y = target.offsetTop + target.offsetHeight;
        break;    
    }
    return { x , y };
}