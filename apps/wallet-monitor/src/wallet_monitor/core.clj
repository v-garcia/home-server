(ns wallet-monitor.core
  (:gen-class)
  (:require
   [wallet-monitor.env :as env]
   [wallet-monitor.report :as rep]
   [wallet-monitor.alphavantage :as av]
   [wallet-monitor.wallet :as wal]
   [wallet-monitor.store :as store]
   [wallet-monitor.utils :as utils]
   [taoensso.timbre :as timbre :refer [info error]]))

(defn get-wallet-w-price!
  []
  (let
   [wallet           (store/load-wallet!)
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
    (store/save-wallet-to-db! wallet)))

(defn wallet-evolution!
  []
  (let [dateFrom   (utils/working-yesterday)
        today-wal  (get-wallet-w-price-memo!)
        prev-wal   (store/load-wallet-of! dateFrom)
        _          (when-not (wal/same-wallet? today-wal prev-wal)
                     (throw (ex-info "Wallet composition changed" {:from prev-wal :to today-wal})))
        d-total    (wal/wallet-value-diff today-wal prev-wal)
        d-price    (wal/wallet-stock-price-diff today-wal prev-wal)]
    (rep/report-wallet-diff! d-total d-price)))

(defn start-action!
  [name f]
  (try
    (info (format "Starting action '%s'" name))
    (f)
    (catch Exception e
      (try
        (->> e
             Throwable->map
             :cause
             (rep/send-gotify-notif!
              (format "Error while executing action '%s'." name)))
        (error e (format "Action '%s' failled." name)) (catch Exception _)))))

(def actions
  {"save-today-wallet"        save-wallet-state!
   "check-wallet-repartition" check-wallet-repartition!
   "wallet-evolution"         wallet-evolution!})

(defn -main
  [& args]
  (info "Wallet-monitor start")

  (doseq [a ["save-today-wallet" "check-wallet-repartition" "wallet-evolution"]]
    (start-action! a (actions a))))



(comment

  (-main)
  (check-wallet-repartition!)
  (start-action! "save-wallet" save-wallet-state!))