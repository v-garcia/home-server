(ns wallet-monitor.domain
  (:require [clojure.spec.alpha :as s]))

(defn ^:private apply-on-list-item
  [op]
  (fn ([key]
       (fn [col]
         (if (empty? col)
           true
           (->>
            col
            (mapv #(get % key))
            (apply op)))))))

(def ^:private distinct-key? (apply-on-list-item distinct?))

(def ^:private identical-key? (apply-on-list-item =))

(def isin-regex #"^([A-Z]{2})([A-Z0-9]{9})([0-9]{1})$")

; units

(s/def ::isin (s/and string? #(re-matches isin-regex %)))

(s/def ::currency #{:EUR})

(s/def ::amount (s/double-in  :NaN? false :infinite? false))

(s/def ::quantity pos-int?)

(s/def ::ratio (s/double-in :min 0.00 :max 1 :NaN? false))

(s/def ::target-ratio ::ratio)

(s/def ::qty-owned ::quantity)

(s/def ::diff-by-line double?)

(s/def ::diff-by-stock double?)


; hash-maps

(s/def ::price (s/keys :req-un [::currency ::amount]))

(s/def ::stock-qty (s/keys :req-un [::isin ::quantity]))

(s/def ::stock-price (s/merge ::price (s/keys :req-un [::isin])))

(s/def ::wallet-line (s/keys :req-un [::isin ::qty-owned ::target-ratio]))

(s/def ::wallet-line-w-prices (s/merge ::wallet-line (s/keys :req-un [::price])))

(s/def ::wallet-line-w-rep-diff
  (s/merge ::wallet-line-w-prices
           (s/keys :req-un [::diff-by-line ::diff-by-stock])))

; collections

(s/def ::prices (s/and
                 (s/coll-of ::price :into [])
                 (identical-key? :currency)))

(s/def ::wallet (s/and
                 (s/coll-of ::wallet-line :into [])
                 (distinct-key? :isin)))

(s/def ::wallet-w-prices (s/and
                          (s/coll-of ::wallet-line-w-prices :into [])
                          (distinct-key? :isin)))

(s/def ::wallet-w-rep-diff (s/and
                            (s/coll-of ::wallet-line-w-rep-diff :into [])
                            (distinct-key? :isin)))







(comment
  (s/valid? ::isin "LU1681038672")
  (s/valid? ::currency :EUR)
  (s/valid? ::quantity -3)
  (s/valid? ::price {::amount 23.3 ::currency :EUR})
  (s/valid? ::price {:amount 23.3 :currency :EUR})
  (s/valid? ::stock-price {::isin "LU1681038672" ::amount 23.3 ::currency :EUR})
  (s/valid? ::wallet-line {::isin "LU1681038672" ::quantity 4})
  (s/valid? ::wallet [{::isin "LU1681038672" ::quantity 4}
                      {::isin "LU1681038672" ::quantity 3}])
  (s/valid? ::prices [{::amount 23.3 ::currency :EUR}
                      {::amount 23.3 ::currency :EUR}])
  (s/valid? ::ratio 1.00)

  (s/valid? ::wallet [{:isin "LU1681038672", :target-ratio 0.1, :qty-owned 10}
                      {:isin "FR0010688168", :target-ratio 0.1, :qty-owned 10}])

  (s/valid? ::wallet-line-with-prices {:isin "LU1681038672", :target-ratio 0.12, :qty-owned 27, :price {:amount 215.65, :currency :EUR}})

  (s/valid? ::wallet-line-with-prices
            [{:isin "LU1681038672", :target-ratio 0.12, :qty-owned 27, :price {:amount 215.65, :currency :EUR}}
             {:isin "FR0010688168", :target-ratio 0.1, :qty-owned 12, :price {:amount 393.0, :currency :EUR}}
             {:isin "FR0010688192", :target-ratio 0.1, :qty-owned 17, :price {:amount 306.2, :currency :EUR}}]))