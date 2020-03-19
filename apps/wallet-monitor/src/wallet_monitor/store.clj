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

(defn- gen-couch-key-fn
  [key-fn]
  (fn [k]
    (case k
      :_id   "_id"
      :_rev  "_rev"
      "_id"  :_id
      "_rev" :_rev
      (key-fn k))))

(defn- get-couch-db-headers!
  []
  {"Authorization" "Basic dmluY2VudDoxUG9tbWVAcm91Z2U="
   "Content-Type" "application/json"})

(defn get-couch-db-url!
  []
  (str (env/get-couchbase-url!) "/wallet_monitor/"))

(defn load-document!
  [docid]
  (->>
   docid
   (str (get-couch-db-url!))
   (hash-map
    :headers (get-couch-db-headers!)
    :method :GET
    :url)
   http/request
   :body
   (#(json/parse-string % (gen-couch-key-fn csk/->kebab-case-keyword)))))

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

(defn- couch-db-encode
  [obj]
  (json/encode obj {:key-fn (gen-couch-key-fn (comp csk/->camelCase name))}))

(defn save-wallet-to-db!
  ([wallet date]
   {:pre [(s/valid? ::d/wallet-w-prices wallet)]}
   (let
    [to-save  {:wallet wallet
               :type   "daily_wallet"
               :_id     (date->dwallet-id date)}

     query    {:method  :POST
               :headers (get-couch-db-headers!)
               :url     (get-couch-db-url!)
               :as      :json
               :body    (couch-db-encode to-save)}
     _        (info query)]
     (http/request query)))
  ([wallet] (save-wallet-to-db! wallet (t/local-date))))

(defn- price->keyword
  [{:keys [:currency :amount] :as p}]
  (assoc p :currency (keyword currency) :amount (double amount)))

(defn load-wallet-of!
  [date]
  {:post [(s/valid? ::d/wallet-w-prices %)]}
  (->>
   date
   date->dwallet-id
   load-document!
   :wallet
   (map #(update-in % [:price] price->keyword))))

(defn load-config!
  []
  (let [config    (load-document! "config")
        config    (update-in config [:diff :amount-to-add] price->keyword)
        conf-diff (:diff config)
        met-once  (:method-once conf-diff)]

    (when met-once
      (->> config
           (update-in config [:diff :method-once] (constantly nil))
           (couch-db-encode)
           (hash-map
            :method :POST
            :headers (get-couch-db-headers!)
            :url    (get-couch-db-url!)
            :as     :json
            :body)
           http/request))
    (if met-once
      (update-in config [:diff :method] (constantly met-once))
      config)))

(comment
  (load-wallet!)
  (load-wallet-of! (t/local-date))
  (t/plus (t/local-date) (t/days  1))
  (load-config!)
  (json/encode  (load-config!))
  (csk/->kebab-case-keyword "pommeRouge"))