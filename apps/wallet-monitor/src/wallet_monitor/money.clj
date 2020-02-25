(ns wallet-monitor.money
  (:require
   [clojure.spec.alpha :as s]
   [wallet-monitor.domain :as d]))

(defn p-apply
  [f p & args]
  {:pre [(s/valid? ::d/price p)]
   :post [(s/valid? ::d/price %)]}
  (update p :amount #(apply f % args)))

(defn p-apply-p
  [f & prices]
  {:pre [(s/valid? ::d/prices prices)]}
  (apply p-apply f (first prices) (map :amount (rest prices))))

(defn sum-prices
  [prices]
  (apply p-apply-p + prices))

(defn same-currency?
  [p1 p2]
  {:pre [(s/valid? ::d/price p1) (s/valid? ::d/price p2)]}
  (= (:currency p1) (:currency p2)))

(defn round
  [p]
  (p-apply #(-> % Math/round double) p))

(defmulti m-to-str
  (fn [d] (= (-> d :amount Math/ceil) (-> d :amount double))))
(defmethod m-to-str false
  [{:keys [:currency :amount]}]
  (let [amount (double amount)]
    (case currency
      :EUR  (format "%.2f€" amount)
      :else "Unknow currency")))

(defmethod m-to-str true
  [{:keys [:currency :amount]}]
  (let [amount (double amount)]
    (case currency
      :EUR  (format "%.0f€" amount)
      :else "Unknow currency")))

(comment
  (= (-> 4 Math/ceil) (double 4))
  (round2 2 (double 31214))
  (m-to-str {:amount 23.00 :currency :EUR})
  (s/valid? ::d/price {:amount 23.00 :currency :EUR})
  (round {:amount 23.00 :currency :EUR})
  (format "%.2f" 213.124124)
  (with-precision 2 (/ (double 24.243) 1))
  (str (double 26.444))
  (format "This was %s a doc" 26.6548)
  (p-apply  #(-> % Math/round double) {:amount 23.3 :currency :EUR})
  (p-apply-p - {:amount 23.0 :currency :EUR} {:amount 19.0 :currency :EUR})
  (p-apply-w  + {:amount 23.0 :currency :EUR} {:amount 21.0 :currency :EUR} {:amount 23.0 :currency :EUR})
  (sum-prices [{:amount 23.0 :currency :EUR} {:amount 21.0 :currency :EUR} {:amount 23.0 :currency :EUR}])
  (s/valid? ::d/price {:amount 23.0 :currency :EUR}))

