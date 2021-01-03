(ns wallet-monitor.store
  (:require
   [clojure.spec.alpha :as s]
   [wallet-monitor.domain :as d]
   [wallet-monitor.env :as env]
   [wallet-monitor.s3 :as s3]
   [java-time :as t]
   [taoensso.timbre :as timbre :refer [info]]
   [cheshire.core :as json]
   [clj-http.lite.client :as http]
   [camel-snake-kebab.core :as csk]))

(def s3-bucket "wallet-monitor")

;; Json convert

(defn get-json-object!
  [& args]
  (->
   (apply s3/get-object-as-str! args)
   (json/parse-string csk/->kebab-case-keyword)))

(defn put-json-object!
  [& args]
  (as->
   (vec args) args
    (conj (vec args) :content-type "application/json")
    (update args 2 #(json/encode % {:key-fn (comp csk/->camelCase name) :pretty true}))
    (apply s3/put-object-from-str! args)))

;; Utils

(defn date->dwallet-id
  [date]
  (->> date
       (t/format "yyyyMMdd")
       (format "daily_wallets/%s_daily_wallet.json")))

(defn- price->keyword
  [{:keys [:currency :amount] :as p}]
  (assoc p :currency (keyword currency) :amount (double amount)))

;; Functions

(defn load-wallet!
  []
  {:post [(s/valid? ::d/wallet %)]}
  (:wallet (get-json-object! s3-bucket "wallet.json")))


(defn save-wallet-to-db!
  ([wallet date]
   {:pre [(s/valid? ::d/wallet-w-prices wallet)]}
   (put-json-object!  s3-bucket (date->dwallet-id date) {:wallet wallet}))
  ([wallet] (save-wallet-to-db! wallet (t/local-date))))

(defn load-wallet-of!
  [date]
  {:post [(s/valid? ::d/wallet-w-prices %)]}
  (->>
   (get-json-object! s3-bucket (date->dwallet-id date))
   :wallet
   (map #(update-in % [:price] price->keyword))))

(defn load-config!
  []
  (->
   (get-json-object! s3-bucket "config.json")
   (update-in [:diff :amount-to-add] price->keyword)))

(comment
  (load-wallet!)
  (load-wallet-of! (t/local-date 2020 03 05))
  (load-wallet-of! (t/local-date))
  (t/plus (t/local-date) (t/days  1))
  (load-config!)
  (json/encode  (load-config!))
  (csk/->kebab-case-keyword "pommeRouge"))