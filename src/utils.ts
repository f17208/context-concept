// returns a DOM element's path to itself
export function getDomPath(el: any) {
  var stack: string[] = [];
  while (el.parentNode !== null) {
    var sibCount = 0;
    var sibIndex = 0;
    for (var i = 0; i < el.parentNode.childNodes.length; i++) {
      var sib = el.parentNode.childNodes[i];
      if (sib.nodeName === el.nodeName) {
        if ( sib === el ) {
          sibIndex = sibCount;
        }
        sibCount++;
      }
    }
    if (el.hasAttribute('id') && el.id !== '') {
      stack.unshift(el.nodeName.toLowerCase() + '#' + el.id);
    } else if (sibCount > 1) {
      stack.unshift(el.nodeName.toLowerCase() + ':eq(' + sibIndex + ')');
    } else {
      stack.unshift(el.nodeName.toLowerCase());
    }
    el = el.parentNode;
  }

  return stack.slice(1); // removes the html element
}