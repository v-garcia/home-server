(ns wallet-monitor.core
  (:gen-class)
  (:require [wallet-monitor.alphavantage :as alphavantage]
            [taoensso.timbre :as timbre :refer [info]]))

(defn -main
  [& args]
  (info "Wallet-monitor start")
  (-> (alphavantage/get-quote! "42D6BJ68V6DR6J3U" "PMEH.PAR")
      clojure.pprint/pprint))