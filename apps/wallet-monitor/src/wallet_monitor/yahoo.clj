(ns wallet-monitor.yahoo  
  (:require 
            [clojure.string :as string]
            [wallet-monitor.stocks :as stocks]
            [wallet-monitor.domain :as d]
            [clojure.spec.alpha :as s]
            [diehard.core :as dh]
            [taoensso.timbre :as timbre :refer [warn info]])
  (:import [yahoofinance YahooFinance]))


(defn ^:private isin->av-sym
  [isin]
  {:pre [(s/valid? ::d/isin isin)]
   :post [(s/valid? some? %)]}
  (get {"LU1681038672" "RS2K.PA"
        "FR0010688168" "CS5.PA"
        "FR0010688192" "CH5.PA"
        "IE00B945VV12" "VGEU.DE"
        "FR0010900076" "ESM.PA"
        "FR0013412020" "PAEEM.PA"
        "FR0011869304" "PMEH.PA"
        "FR0013412285" "PE500.PA"
        "LU1377382285" "VALU.F"}
       isin))


(defn get-yahoo-quote!
  [sym]
  (let 
   [stock (YahooFinance/get sym)
    c     (-> stock .getCurrency string/upper-case keyword)
    p     (-> stock .getQuote .getPrice .doubleValue)
    ]
    {:amount p :currency c}
    ))

(defn get-quote!
  [isin]
  {:pre [(s/valid? ::d/isin isin)]
   :post [(s/valid? ::d/price %)]}
  (->>
   isin
   isin->av-sym
   get-yahoo-quote!
 ))

(defmethod stocks/get-quote! ::stocks/yahoo 
  [_ isin]
  (get-quote! isin))

(comment
  (get-yahoo-quote! "VALU.F")
  (get-quote! "LU1377382285")
  )
