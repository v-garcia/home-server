(ns wallet-monitor.report
  (:require
   [cheshire.core :as json]
   [clj-http.lite.client :as http]
   [camel-snake-kebab.core :as csk]
   [clojure.spec.alpha :as s]
   [wallet-monitor.domain :as d]
   [wallet-monitor.env :as env]
   [wallet-monitor.boursedirect :as bd]
   [wallet-monitor.money :as m]))

(defn send-gotify-notif!
  [title message]
  (->>
   {:title title :message message :priority 1}
   (#(json/encode % {:key-fn (comp csk/->camelCase name)}))
   (hash-map
    :url     (str (env/get-gotify-url!) "/message")
    :method  :post
    :headers {"X-Gotify-Key" (env/get-gotify-token!)
              "Content-Type" "application/json"}
    :body)

   http/request))


(defn report-repartion-diff!
  [wallet]
  {:pre [(s/valid? ::d/wallet-w-rep-diff wallet)]}
  (->>
   wallet
   (mapv (fn [{:keys [:isin :diff-by-stock]}]
           [(format "Stock %s needs balancing" (-> isin bd/stocks :mnemo))
            (format "%s %d units for: %s"
                    (if (neg? diff-by-stock) "Sell" "Buy")
                    (-> diff-by-stock Math/round Math/abs)
                    (-> isin bd/stocks :libelle))]))
   (map (partial apply send-gotify-notif!))
   doall))


(comment
  (name "asa")
  (csk/->camelCase "pso-sd")
  (json/encode {:pomme-rouge 2} {:key-fn (comp csk/->camelCase name)})
  (send-gotify-notif! "yoh" "test"))
