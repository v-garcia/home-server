(ns wallet-monitor.alphavantage
  (:require [cheshire.core :as json]
            [clj-http.lite.client :as http]
            [camel-snake-kebab.core :as csk]
            [clojure.string :as string]
            [com.rpl.specter :as specter]
            [wallet-monitor.env :as env]
            [wallet-monitor.domain :as d]
            [clojure.spec.alpha :as s]
            [diehard.core :as dh]
            [wallet-monitor.stocks :as stocks]
            [taoensso.timbre :as timbre :refer [warn info]]))

(defn ^:private rm-key-numerotation
  [key]
  (string/replace-first key #"^(\d+\. )" ""))

(def ^:private is-number?
  (partial re-find #"^-?\d+\.?\d*$"))

(def stocks
  {"LU1681038672" "RS2K.PAR"
   "FR0010688168" "CS5.PAR"
   "FR0010688192" "CH5.PAR"
   "IE00B945VV12" "VEUR.AMS"
   "FR0010900076" "ESM.PAR"
   "FR0013412020" "PAEEM.PAR"
   "FR0011869304" "PMEH.PAR"
   "FR0013412285" "PE500.PAR"
   "LU1377382285" "VALU.FRK"

   "LU1834985845" "FOO.PAR"
   "LU1681041544" "CEM.PAR"})

; Note get alphavantage symbol:
; https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=FR0013412285&apikey=
(defn ^:private isin->av-sym
  [isin]
  {:pre [(s/valid? ::d/isin isin)]
   :post [(s/valid? some? %)]}
  (get stocks isin))


(defn ^:private isin->currency
  ; Only euro for now
  [isin]
  {:pre [(s/valid? ::d/isin isin)]
   :post [(s/valid? ::d/currency %)]}
  :EUR)

(defn ^:private parse-num-values
  [map]
  (specter/transform [specter/MAP-VALS string? is-number?] read-string map))

(defn ^:private get-av-quote!
  ([api-key symbol]
   (->
    (format
     "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=%s&apikey=%s"
     symbol
     api-key)
    http/get
    :body
    (json/parse-string (comp  csk/->kebab-case-keyword rm-key-numerotation))
    (#(do
        (when-let [msg (:note %)]
          (throw (ex-info (str "Api quota exceeded ") {:msg msg})))
        (when-let [error (:error-message %)]
          (throw (ex-info (str "Unknow alphavantage error") {:msg error})))
        %))
    :global-quote
    parse-num-values))
  ([symbol] (get-av-quote! (env/get-alphavantage-api-key!) symbol)))

(dh/defbulkhead bh {:concurrency 10})
(defn safe-get-av-quote!
  [& args]
  (dh/with-bulkhead
    bh
    (dh/with-retry
      {:retry-on           Exception
       :max-retries        3
       :delay-ms           60000
       :on-failed-attempt  (fn [_ ex] (warn {:msg "failed attempt" :ex ex}))}
      (apply get-av-quote! args))))



(defn get-quote!
  [isin]
  {:pre [(s/valid? ::d/isin isin)]
   :post [(s/valid? ::d/price %)]}
  (->>
   isin
   isin->av-sym
   safe-get-av-quote!
   :price
   (hash-map :currency (isin->currency isin) :amount)))


(defmethod stocks/get-quote! ::stocks/alphavantage
  [_ isin]
  (get-quote! isin))

(comment
  (get-av-quote! "RS2K.PAR")
  (get-quote! "LU1681038672")
  (dotimes [n 10] (print (safe-get-av-quote! "PE500.PAR"))))