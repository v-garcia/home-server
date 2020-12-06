function getNewsSlurpUrl() {
  return window.location.protocol + '//' + ['news', ...window.location.hostname.split('.').slice(1)].join('.');
}

let lastLink = null;
function callback(mutationsList, observer) {
  for (const mutation of mutationsList) {


    if (mutation.type === "childList") {
      const found = mutation.target.querySelector('.toolbar-item[href][target="_blank"]:not(.new-external-link)');
      if (!found || found === lastLink) continue;
      lastLink = found;
    }

    if (mutation.type === 'attributes' && mutation.target !== lastLink) continue;


    appendCustomLink(lastLink);
  }
}

function appendCustomLink(source) {
  document.querySelector('.new-external-link')?.remove();
  const newLink = source.cloneNode(true);
  newLink.classList.add('new-external-link');
  newLink.href = `${getNewsSlurpUrl()}/slurp?page_url=${encodeURI(source.href)}`;
  newLink.setAttribute('title', 'Open with news slurper');
  source.after(newLink);
}

const observer = new MutationObserver(callback);
observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['href'] });

