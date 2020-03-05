(ns wallet-monitor.wallet
  (:require
   [clojure.spec.alpha :as s]
   [wallet-monitor.domain :as d]
   [wallet-monitor.env :as env]
   [wallet-monitor.money :as m]
   [java-time :as t]
   [wallet-monitor.utils :as utils]
   [taoensso.timbre :as timbre :refer [info]]
   [cheshire.core :as json]
   [clj-http.lite.client :as http]
   [camel-snake-kebab.core :as csk]))

(def diff-tolerance 0.05)
(def diff-by-stock-tolerance 0.6)


(defn total-wallet
  [wallet]
  {:pre [(s/valid? ::d/wallet-w-prices wallet)]
   :post [(s/valid? ::d/price %)]}
  (->> wallet
       (mapv (fn [{:keys [:price :qty-owned]}]
               (m/p-apply * price qty-owned)))
       m/sum-prices))

(defn line-repartition-diff
  [{total :amount}
   {:keys [:qty-owned  :target-ratio]
    {stock-price :amount} :price}]
  (let [line-price        (* stock-price qty-owned)
        ideal-line-price  (* total target-ratio)
        diff              (- ideal-line-price line-price)
        diff-by-line      (/ diff line-price)
        diff-by-stock     (/ diff stock-price)]

    {:diff-by-line diff-by-line :diff-by-stock diff-by-stock}))

(defn needs-balance?
  [{:keys [:diff-by-line :diff-by-stock]}]
  (and
   (-> diff-by-line Math/abs (> diff-tolerance))
   (-> diff-by-stock Math/abs (> diff-by-stock-tolerance))))

(defn diff-ratios->diff-unit
  [{:keys [:diff-by-stock] :as l}]
  (-> l
      (assoc :stock-diff (Math/round diff-by-stock))
      (dissoc  :diff-by-line :diff-by-stock)))

(defn repartition-diff
  ([wallet]
   (repartition-diff wallet (total-wallet wallet)))
  ([wallet total]
   (->> wallet
        (map (partial line-repartition-diff total))
        (map merge wallet)
        (filter needs-balance?))))

(defn repartition-diff-buy-and-sell
  [wallet]
  {:pre [(s/valid? ::d/wallet-w-prices wallet)]
   :post [(s/valid? ::d/wallet-w-rep-diff %)]}
  (->> wallet repartition-diff (map diff-ratios->diff-unit)))

(defn repartition-diff-only-buy
  [wallet]
  {:pre [(s/valid? ::d/wallet-w-prices wallet)]
   :post [(s/valid? ::d/wallet-w-rep-diff %)]}
  (loop
   [total (total-wallet wallet)]
    (let
     [to-update  (repartition-diff wallet total)
      to-sell    (filter (comp neg? :diff-by-stock) to-update)]
      (if
       (empty? to-sell)
        (map diff-ratios->diff-unit to-update)
        (recur (m/p-apply + total 1))))))

(defn wallet-stock-price-diff
  [wal1 wal2]
  {:pre [(s/valid? ::d/wallet-w-prices wal1)
         (s/valid? ::d/wallet-w-prices wal2)
         (= (->> wal1 (map :isin) set) (->> wal2 (map :isin) set))
         (m/same-currency? (-> wal1 first :price) (-> wal2 first :price))]}
  (let
   [sfn  #(compare (:isin %1) (:isin %2))
    wal1 (sort sfn wal1)
    wal2 (sort sfn wal2)]
    (->> wal1
         (mapv (fn [{{a1 :amount} :price isin :isin}
                    {{a2 :amount} :price}]
                 {:isin isin :ratio (- (/ a2 a1) 1)}) wal2)
         (sort #(> (Math/abs (:ratio %1)) (Math/abs (:ratio %2)))))))

(defn wallet-value-diff
  [wal1 wal2]
  {:pre [(s/valid? ::d/wallet-w-prices wal1) (s/valid? ::d/wallet-w-prices wal2)]}
  (let
   [tot1   (total-wallet wal1)
    tot2   (total-wallet wal2)
    diff   (m/p-apply-p - tot1 tot2)]
    diff))

(defn same-wallet?
  [wal1 wal2]
  {:pre [(s/valid? ::d/wallet wal1) (s/valid? ::d/wallet wal2)]}
  (let [to-set (fn [w] (->> w (mapv (fn [{:keys [:isin :qty-owned]}] [isin qty-owned])) set))]
    (= (to-set wal1) (to-set wal2))))

(comment
  (t/plus (t/local-date) (t/days  1))
  (.minusDays (java.time.LocalDateTime/now) 1)
  (-> "yyyyMMdd"
      java.time.format.DateTimeFormatter/ofPattern
      (.format (java.time.LocalDateTime/now)))

  (t/minus (t/local-date)
           (t/days 1))

  (= (t/day-of-week (t/local-date)) (t/day-of-week :sunday))

  (-> "yyyyMMdd"
      java.time.format.DateTimeFormatter/ofPattern
      (.format (java.time.LocalDateTime/now)))
  (.format (java.time.format.DateTimeFormatter/ofPattern "yyyyMMdd") (java.time.LocalDateTime/now))
  (.parse java.time.LocalDateTime/now  "yyyyMMdd")
  (->>

   (.format (java.text.SimpleDateFormat. "yyyyMMdd")   (java.util.Date.)))
  (m/p-apply * {:amount 215.65, :currency :EUR} 2)
  (update-in
   [{:isin "LU1681038672", :target-ratio 0.12, :qty-owned 27, :price {:amount 215.65, :currency :EUR}}
    {:isin "FR0010688168", :target-ratio 0.1, :qty-owned 12, :price {:amount 393.0, :currency :EUR}}]
   [0 :price :amount]  + 3)


  (#(update %1 :qty-owned (partial + (:qty-owned %2))) {:isin "LU1681038672", :target-ratio 0.12, :qty-owned 27, :price {:amount 215.65, :currency :EUR}}
                                                       {:isin "LU1681038672", :target-ratio 0.12, :qty-owned 27, :price {:amount 215.65, :currency :EUR}})


  (merge-wallets  #(update %1 :qty-owned (partial + (:qty-owned %2)))
                  '({:isin "LU1681038672", :target-ratio 0.12, :qty-owned 27, :price {:amount 215.65, :currency :EUR}}
                    {:isin "FR0010688168", :target-ratio 0.1, :qty-owned 12, :price {:amount 393.0, :currency :EUR}})
                  '({:isin "LU1681038672", :target-ratio 0.12, :qty-owned 27, :price {:amount 215.65, :currency :EUR}}
                    {:isin "FR0010688168", :target-ratio 0.1, :qty-owned 12, :price {:amount 393.0, :currency :EUR}}))

  (repartition-diff
   '({:isin "LU1681038672", :target-ratio 0.12, :qty-owned 27, :price {:amount 215.65, :currency :EUR}}
     {:isin "FR0010688168", :target-ratio 0.1, :qty-owned 12, :price {:amount 393.0, :currency :EUR}}
     {:isin "FR0010688192", :target-ratio 0.1, :qty-owned 17, :price {:amount 306.2, :currency :EUR}}
     {:isin "IE00B945VV12", :target-ratio 0.15, :qty-owned 203, :price {:amount 33.135, :currency :EUR}}
     {:isin "FR0010900076", :target-ratio 0.08, :qty-owned 76, :price {:amount 51.81, :currency :EUR}}
     {:isin "FR0013412020", :target-ratio 0.08, :qty-owned 171, :price {:amount 20.81, :currency :EUR}}
     {:isin "FR0011869304", :target-ratio 0.08, :qty-owned 212, :price {:amount 16.715, :currency :EUR}}
     {:isin "FR0013412285", :target-ratio 0.2, :qty-owned 404, :price {:amount 23.582, :currency :EUR}}
     {:isin "LU1377382285", :target-ratio 0.08, :qty-owned 25, :price {:amount 129.98, :currency :EUR}})))

(defn harmonize-wallet
  [wallet]
  {:pre [(s/valid? ::d/wallet-w-rep-diff wallet)]
   :post [(s/valid? ::d/wallet-w-rep-diff %)]}
  (map (fn [{:keys [:diff-by-stock :price] :as l}]
         (if (needs-balance? l)
           (m/p-apply + price (Math/round diff-by-stock))
           l))) wallet)
	
	
	
(defn intersect-keys
  [hm1 hm2]
  (set/intersection
   (-> hm1 keys set)
   (-> hm2 keys set)))

(comment
  (select-keys  {:a 1 :b 3} (intersect-keys {:a 1 :b 2} {:b 4 :g 4})))
  
  
  (defn repartition-diff-only-buy
  [wallet]
  {:pre [(s/valid? ::d/wallet-w-prices wallet)]
   :post [(s/valid? ::d/wallet-w-rep-diff %)]}
  (loop
   [wallet* wallet]
    (let
     [rep-diff  (repartition-diff wallet*)
      to-update (filter needs-balance? rep-diff)
      to-buy    (filter (comp pos? :diff-by-stock) to-update)]
      (cond
        (empty? to-update)
        (->> wallet*
             (merge-wallets-strict (fn []) wallet)
             (map diff-ratios->diff-unit))
        (and
         (seq to-update)
         (empty? to-buy))    (throw
                              (ex-info "Only sells" {:to-update to-update :to-buy to-buy}))
        :else           (->>
                         (harmonize-wallet to-buy)
                         (merge-wallets-strict  #(update %1 :qty-owned (partial + (:qty-owned %2))) rep-diff)
                         recur))))).
						 .


; (defn- wallet->w-by-idin
;   [wallet]
;   (->> wallet
;        (map #(vector (:isin %) %))
;        (into {})))

; (defn- merge-wallets-strict
;   [f w1 w2]
;   (let
;    [w1 (wallet->w-by-idin w1)
;     w2 (wallet->w-by-idin w2)]
;     (-> w1
;         (merge-with f  w2)
;         (select-keys (utils/intersect-keys w1 w2))
;         vals)
;     (vals (merge-with f w1 w2))))


        (cond
          (empty? to-update) (mapv diff-ratios->diff-unit wallet)
          (and
           (seq to-update)
           (empty? to-buy))    (throw
                                (ex-info "Only sells" {:to-update to-update :to-buy to-buy}))
          :else           (->>
                           (harmonize-wallet to-buy)
                           (merge-wallets-strict  #(update %1 :qty-owned (partial + (:qty-owned %2))) rep-diff)
                           recur)))))
