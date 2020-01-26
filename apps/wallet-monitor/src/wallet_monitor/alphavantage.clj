(ns wallet-monitor.alphavantage
  (:require [cheshire.core :as json]
            [clj-http.lite.client :as http]
            [camel-snake-kebab.core :as csk]
            [clojure.string :as string]
            [com.rpl.specter :as specter]))

(defn ^:private rm-key-numerotation
  [key]
  (string/replace-first key #"^(\d+\. )" ""))

(def ^:private is-number?
  (partial re-find #"^-?\d+\.?\d*$"))

(defn ^:private parse-num-values
  [map]
  (specter/transform [specter/MAP-VALS string? is-number?] read-string map))

(defn get-quote!
  [api-key symbol]
  (->
   (format
    "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=%s&apikey=%s"
    symbol
    api-key)
   http/get
   :body
   (json/parse-string (comp  csk/->kebab-case-keyword rm-key-numerotation))
   :global-quote
   parse-num-values))
