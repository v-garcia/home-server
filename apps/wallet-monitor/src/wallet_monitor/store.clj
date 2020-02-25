(ns wallet-monitor.store
  (:require
   [clojure.spec.alpha :as s]
   [wallet-monitor.domain :as d]
   [wallet-monitor.env :as env]
   [java-time :as t]
   [taoensso.timbre :as timbre :refer [info]]
   [cheshire.core :as json]
   [clj-http.lite.client :as http]
   [camel-snake-kebab.core :as csk]))



(defn load-document!
  [docid]
  (->>
   docid
   (str (env/get-couchbase-url!) "/wallet_monitor/")
   (hash-map
    :method :GET
    :url)
   http/request
   :body
   (#(json/parse-string % csk/->kebab-case-keyword))))

(defn load-wallet!
  []
  {:post [(s/valid? ::d/wallet %)]}
  (->
   "wallet"
   load-document!
   :wallet))

(defn date->dwallet-id
  [date]
  (->> date
       (t/format "yyyyMMdd")
       (format "%s_daily_wallet")))

(defn save-wallet-to-db!
  ([wallet date]
   {:pre [(s/valid? ::d/wallet-w-prices wallet)]}
   (let
    [to-save  {:wallet wallet
               :type   "daily_wallet"
               :_id     (date->dwallet-id date)}

     query    {:method :POST
               :headers {"Content-Type" "application/json"}
               :url    (str (env/get-couchbase-url!) "/wallet_monitor")
               :as     :json
               :body   (json/encode to-save {:key-fn #(if (= :_id %)
                                                        "_id"
                                                        (csk/->camelCase (name %)))})}
     _        (info query)]
     (http/request query)))
  ([wallet] (save-wallet-to-db! wallet (t/local-date))))

(defn load-wallet-of!
  [date]
  {:post [(s/valid? ::d/wallet-w-prices %)]}
  (->>
   date
   date->dwallet-id
   load-document!
   :wallet
   (map #(update-in % [:price :currency] keyword))))


(comment
  (load-wallet!)
  (load-wallet-of! (t/local-date))
  (t/plus (t/local-date) (t/days  1)))