(ns wallet-monitor.core
  (:gen-class)
  (:require
   [wallet-monitor.report :as rep]
   [wallet-monitor.wallet :as wal]
   [wallet-monitor.store :as store]
   [wallet-monitor.utils :as utils]
   [wallet-monitor.stocks :as stocks]
   [wallet-monitor.yahoo]
   [wallet-monitor.alphavantage]
   [taoensso.timbre :as timbre :refer [info error]])) 

(defn get-wallet-w-price!
  []
  (let
   [wallet           (store/load-wallet!)
    _                (info {:wallet wallet})]
    (->> wallet
         (map :isin)
         stocks/get-stock-prices!
         (map #(assoc %1 :price %2) wallet))))

(def get-wallet-w-price-memo! (memoize get-wallet-w-price!))

(defn check-wallet-repartition!
  [fn-diff & args]
  (let
   [wallet           (get-wallet-w-price-memo!)
    _                (info {:wallet wallet})

    diff             (apply fn-diff wallet args)

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

(defn get-actions
  [config]
  (vector
   [:save-today-wallet save-wallet-state!]
   (case (:diff-method config)
     :buy-and-sell [:diff-buy-and-sell (partial check-wallet-repartition! wal/repartition-diff-buy-and-sell (:amount-to-add config))]
     :only-buy     [:diff-only-buy     (partial check-wallet-repartition! wal/repartition-diff-only-buy (:amount-to-add config))])
   [:wallet-evolution  wallet-evolution!]))

(defn -main
  [& _]
  (info "Wallet-monitor start")
  (let
   [config  (store/load-config!)
    actions (get-actions config)]
    (doseq [[action-name actionfn] actions]
      (start-action! action-name actionfn))))



(comment

  (-main)

  (stocks/get-quote! ::stocks/yahoo "IE00B945VV12")
  (store/load-wallet-of! (utils/working-yesterday))

  (-main)
  (store/load-wallet!)
  (get-wallet-w-price-memo!)

  (clojure.set/difference
   (->> (store/load-wallet!) (map :isin) set)
   #_(-> wallet-monitor.alphavantage/stocks keys set)
   (-> wallet-monitor.yahoo/stocks keys set)
   #_(-> wallet-monitor.boursedirect/stocks keys set))

  (->>  (check-wallet-repartition!
         wal/repartition-diff-buy-and-sell
         {:amount   2000.0
          :currency :EUR}))


  (->>  (check-wallet-repartition!
         wal/repartition-diff-only-buy
         {:amount   10.0
          :currency :EUR}))

  (-main)

  (->>
   (wal/diff-buy-and-sell (get-wallet-w-price!) {:amount   2000.0
                                                 :currency :EUR})
   wal/total-wallet-diff)







  (wallet-monitor.money/p-apply-p +
                                  {:amount 31636.861100000002, :currency :EUR}
                                  {:amount 10000.0, :currency :EUR})
  (start-action! "save-wallet" save-wallet-state!))