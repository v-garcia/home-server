(ns wallet-monitor.core
  (:gen-class)
  (:require
   [wallet-monitor.env :as env]
   [wallet-monitor.report :as rep]
   [wallet-monitor.alphavantage :as av]
   [wallet-monitor.wallet :as wal]
   [taoensso.timbre :as timbre :refer [info]]))

(defn get-wallet-w-price!
  []
  (let
   [wallet           (wal/load-wallet!)
    _                (info {:wallet wallet})]
    (->> wallet
         (map :isin)
         av/get-stock-prices!
         (map #(assoc %1 :price %2) wallet))))

(def get-wallet-w-price-memo! (memoize get-wallet-w-price!))

(defn check-wallet-repartition!
  []
  (let
   [wallet           (get-wallet-w-price-memo!)
    _                (info {:wallet wallet})

    diff             (wal/repartition-diff wallet)

    report           (rep/report-repartion-diff! diff)]
    report))

(defn save-wallet-state!
  []
  (let
   [wallet           (get-wallet-w-price-memo!)
    _                (info {:wallet wallet})]
    (wal/save-wallet! wallet)))


(defn -main
  [& args]
  (info "Wallet-monitor start")
  (-> (check-wallet-repartition!)
      clojure.pprint/pprint))


(comment
  (check-wallet-repartition!)
  (save-wallet-state!))