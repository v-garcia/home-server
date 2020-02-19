(ns wallet-monitor.wallet
  (:require
   [clojure.spec.alpha :as s]
   [wallet-monitor.domain :as d]
   [wallet-monitor.env :as env]
   [wallet-monitor.money :as m]
   [clojure.pprint :as pp]
   [java-time :as t]))

(def diff-tolerance 0.05)
(def diff-by-stock-tolerance 0.6)

(defn load-wallet!
  []
  {:post [(s/valid? ::d/wallet %)]}
  (->
   (env/get-wallet-path!)
   slurp
   read-string
   :wallet))

(defn save-wallet!
  [wallet]
  {:pre [(s/valid? ::d/wallet-w-prices wallet)]}
  (let
   [iso-date (t/format (t/local-date) "yyyyMMdd")]
    (->
     (format "%s/%s-wallet.edn" (env/get-output-folder!) iso-date)
     (spit (with-out-str (pp/pprint wallet))))))

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

(defn repartition-diff
  [wallet]
  {:pre [(s/valid? ::d/wallet-w-prices wallet)]
   :post [(s/valid? ::d/wallet-w-rep-diff %)]}
  (let [total (total-wallet wallet)]
    (->> wallet
         (map (partial line-repartition-diff total))
         (map merge wallet)
         (filter
          #(and
            (-> %
                :diff-by-line
                Math/abs
                (> diff-tolerance))
            (-> %
                :diff-by-stock
                Math/abs
                (> diff-by-stock-tolerance)))))))

(defn working-yesterday
  []
  (let
   [today     (t/local-date)
    yesterday (t/minus today (t/days - 1))
    dow       (t/day-of-week today)
    ]
    (if
     (or
      (= dow
         (t/day-of-week :sunday)
         )
      (= dow
         (t/day-of-week :saturday))))
    
    
    
    ))
  (t/minus
   (t/local-date)
   (t/days 1)))

(comment
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