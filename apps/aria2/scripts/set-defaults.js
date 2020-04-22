(() => {
    const STORAGE_KEY = "AriaNg.Options";
  
    if (window.localStorage.getItem(STORAGE_KEY)) {
      // We only set the defaults
      return;
    }

    const isHttps = window.location.href.startsWith("https");
  
    const defaultConfig = {
      rpcHost: window.location.hostname,
      rpcInterface: "jsonrpc",
      rpcPort: isHttps ? 443 : 80,
      protocol: isHttps ? "wss" : "ws",
    };
  
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig));
  })();