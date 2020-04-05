(ns wallet-monitor.stocks
  (:require 
   [wallet-monitor.domain :as d]
   [clojure.spec.alpha :as s]
   [taoensso.timbre :as timbre :refer [warn info error]]))

;; order is used to get source priority
;; use sorted-set-by to customize order
(def quote-providers  (sorted-set  ::alphavantage ::yahoo))

(defmulti get-quote!
  (fn [provider _]
    {:pre [(quote-providers provider)]}
    provider))


(defn get-quote-from-providers!
  ([providers isin]
   (let
    [[p :as ps] (vec providers)
     f #(get-quote! p isin)]
     (if  (= 1 (count ps))
       (f)
       (try (f)
            (catch Exception e
              (error "Error" :provider p :exception e)
              (get-quote-from-providers! (rest ps) isin))))))
  ([isin] (get-quote-from-providers! quote-providers isin)))

(defn get-stock-prices!
  [isins]
  {:pre [(s/valid? (s/coll-of ::d/isin) isins)]
   :post [(s/valid? (s/coll-of ::d/price) %)]}
  (doall (map get-quote-from-providers! isins)))

(comment
  (get-quote!  ::yahoo "LU1377382285")
  (get-quote!  ::alphavantage "LU1377382285")
  (get-quote-from-providers! "LU1377382285")
  (get-stock-prices! ["FR0010688192" "FR0013412020"])
  )