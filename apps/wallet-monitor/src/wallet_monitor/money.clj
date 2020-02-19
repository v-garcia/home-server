(ns wallet-monitor.money
  (:require
   [clojure.spec.alpha :as s]
   [wallet-monitor.domain :as d]))


(defn p-apply
  [f p & args]
  {:pre [(s/valid? ::d/price p)]
   :post [(s/valid? ::d/price %)]}
  (update p :amount #(apply f % args)))


(defn sum-prices
  [prices]
  {:pre [(s/valid? ::d/prices prices)]
   :post [(s/valid? ::d/price %)]}
  (->> prices
       (mapv :amount)
       (apply +)
       (hash-map :currency (-> prices first :currency) :amount)))


(comment
  (p-apply  * {:amount 23.0 :currency :EUR} 2)
  (s/valid? ::d/price {:amount 23.0 :currency :EUR}))

