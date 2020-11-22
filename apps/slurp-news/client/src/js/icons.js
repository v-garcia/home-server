import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faSpinner, faCheck, faTimes } from '@fortawesome/free-solid-svg-icons'

library.add(faSpinner)
library.add(faCheck)
library.add(faTimes);
// Replace any existing <i> tags with <svg> and set up a MutationObserver to
// continue doing this as the DOM changes.
dom.watch();
