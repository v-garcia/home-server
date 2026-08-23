import { debounce } from "./js/utils";

// State managment

const baseState = { urlInputState: 'default', selectedProvider: null, formState: 'default' };
let _state = { ...baseState };

function setState(newState) {
  let oldState = _state;
  _state = { ..._state, ...newState };
  refreshUi(oldState, _state);
}

// HTML elements

const urlInputElem = document.getElementById('page_url');
const urlInputCtnElem = document.getElementById('page_url_ctn');
const providersListElem = document.getElementById('provider-list');
const submitBtnElem = document.getElementById('submit-btn');
const providerLogoElem = document.getElementById('provider-logo');
const formLoadingCtn = document.getElementById('form_loading_ctn');
const mainForm = document.getElementById('search-url-form');

// Ui managment

function refreshUi(oldState, { urlInputState, selectedProvider, formState }) {

  // Check urlInputState
  if (urlInputState !== oldState.urlInputCtnElem) {
    for (let c of urlInputCtnElem.classList) {
      c.endsWith('-state') && urlInputCtnElem.classList.remove(c);
    }
    urlInputCtnElem.classList.add(`${urlInputState}-state`)

    urlInputElem.setCustomValidity((urlInputState === 'valid' ? '' : "L'url fournie n'est pas pas reconnue"));
  }

  // Select provider
  if (selectedProvider !== oldState.selectedProvider) {
    for (let el of providersListElem.childNodes) {
      el.classList.remove('selected');
    }

    for (let c of providerLogoElem.classList) {
      c.startsWith('logo-') && providerLogoElem.classList.remove(c);
    }

    if (selectedProvider) {
      const provider = providersListElem.querySelector(`[data-provider-name="${selectedProvider}"]`);
      provider.classList.add('selected');
      providerLogoElem.classList.add(`logo-${selectedProvider}`);
    }
  }


  // On form loading
  if (formState !== oldState.formState) {
    const isLoading = (formState === 'loading');
    formLoadingCtn.classList[isLoading ? 'add' : 'remove']('visible');
    submitBtnElem.classList[isLoading ? 'add' : 'remove']('disabled');
    urlInputElem.disabled = isLoading;
  }
}

// Api methods

async function displayProviders() {
  const providers = await (await fetch('/api/providers')).json().catch(() => alert("Failling to get back providers"));
  const links = providers.map(({ fullName, url, name }) => {
    const elem = document.createElement("a");
    elem.href = url;
    elem.text = fullName;
    elem.dataset.providerName = name;
    elem.target = "_blank"
    return elem;
  })

  providersListElem.innerHTML = '';
  providersListElem.append(...links);
}

const checkUrl = debounce(async function checkUrl(url) {
  const response = await (
    await fetch('/api/checkUrl',
      {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      }))
    .json()
    .catch(() => alert("Failling verify url"));

  const { found, provider } = response || {};
  if (found) {
    setState({ urlInputState: 'valid', selectedProvider: provider });
  } else {
    setState({ urlInputState: 'error' });
  }
}, 250);

// Events

window.addEventListener('pageshow', async () => {
  await displayProviders();

  urlInputElem.dispatchEvent(new Event('input', {}));
});

urlInputElem.addEventListener('input', ({ target }) => {
  const url = target.value;

  if (!url) {
    setState({ urlInputState: 'default', selectedProvider: null });
    return;
  }

  setState({ urlInputState: 'loading', selectedProvider: null });
  checkUrl(url);
});

mainForm.addEventListener('submit', e => {
  setTimeout(() => setState({ formState: 'loading' }), 0);
});
