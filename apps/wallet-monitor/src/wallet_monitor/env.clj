(ns wallet-monitor.env
  (:require
   [wallet-monitor.domain :as d]
   [clojure.spec.alpha :as s]))


(def get-env!
  (memoize #(System/getenv)))

(defn get-couchbase-url!
  []
  (get (get-env!) "COUCHBASE_URL"))

(defn get-alphavantage-api-key!
  []
  (get (get-env!) "ALPHAVANTAGE_API_KEY"))

(defn get-gotify-url!
  []
  (get (get-env!) "GOTIFY_URL"))

(defn get-gotify-token!
  []
  (get (get-env!) "GOTIFY_TOKEN"))
