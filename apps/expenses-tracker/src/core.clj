(ns tasks
  (:require [babashka.pods :as pods]
            [babashka.curl :as curl]
            [clojure.string :as str]
            [clojure.java.shell :as shell]
            [clojure.data.csv :as csv]
            [babashka.deps :as deps]
            [taoensso.timbre :as timbre])
  (:import
   [java.time LocalDate]
   [java.time.format DateTimeFormatter]))

(deps/add-deps '{:deps {camel-snake-kebab/camel-snake-kebab {:mvn/version "0.4.2"}}})

(require '[camel-snake-kebab.core :as csk])



(def expenses-bucket "boursorama-tracker")

(defn parse-csv [data-string]
  (as-> data-string %
    (csv/read-csv % :separator \,)
    (mapv (partial zipmap (->> (first %) (mapv csk/->kebab-case-keyword))) (rest %))))

(defn presign-s3-url
  [bucket key & {:keys [:expires-in] :or {expires-in 10}}]
  (-> (shell/sh "aws" "s3" "presign"
                "--endpoint-url" (System/getenv "AWS_S3_ENDPOINT")  "--region" (System/getenv "AWS_REGION")
                "--expires-in" (str expires-in)
                (format "s3://%s/%s" bucket key))
      :out str/trim))

(defn get-s3-object
  [bucket key & {:keys [:curl-opts]}]
  (timbre/debug "get-s3-object" bucket key)
  (-> (presign-s3-url bucket key) (curl/get curl-opts)))

(defn get-daily-expenses
  [date]

  (as->
   (.format (DateTimeFormatter/ofPattern "yyyyMMdd") date) %
    (format "movements/%s/%s_movements.csv" (System/getenv "BOURSO_ACCOUNT_0") %)
    (get-s3-object expenses-bucket % :curl-opts {:throw false})
    (case (:status %)
      200 (parse-csv (:body %))
      404 nil
      (throw (ex-info "get-daily-expenses had unexpected code result" %)))))

(defn get-expenses
  [from to]
  (->> (.datesUntil from to) .iterator iterator-seq (mapcat get-daily-expenses)))

(defn get-prev-month-expenses
  []
  (let [oneMonthAgo (.minusMonths (LocalDate/now) 1)
        firstDay    (.withDayOfMonth oneMonthAgo 1)
        lastDay     (.withDayOfMonth oneMonthAgo (.lengthOfMonth oneMonthAgo))]
    (get-expenses firstDay lastDay)))

(defn enrich-expenses-data
  [data]
  (->> data
       distinct ;; Todo: fix duplicated in extract
       )
  )

(comment

  (def e (get-prev-month-expenses))
  (def exp e)
  (->> exp
       distinct
       (map #(update % :amount read-string))
       (map (fn [{:keys [:amount]
                  :as   e}] 
              (-> e
                  (assoc :credit? (pos? amount))
                  
                  )))
    (#(spit "test.edn" (with-out-str (clojure.pprint/pprint %))))
       
       )
       )
(read-string "23")

  (->> (frequencies e) (remove (fn [[k v]] (<= v 1))))
  (count e)
  (count (distinct e))
  (->> (map :amount e) (map #(Float/parseFloat %)) (apply +))
  (get-daily-expenses (java.time.LocalDate/of 2021 10 9)))

(comment
  (curl/get "https://serve.babardo.com/aze" {:throw false})
  (as->
   (shell/sh "aws" "s3" "presign"
             "--endpoint-url" "https://s3.fr-par.scw.cloud"  "--region" "fr-par" "--expires-in" "10"
             "s3://boursorama-tracker/movements/c3395ffeab9f7c24773fcb0d1c8fa523/20210209_movements.csv") %
    (:out %) (str/trim %)
    #_(curl/get %))


  (shell/sh "bash", "-l", "-c" "aws s3 presign s3://boursorama-tracker/movements/c3395ffeab9f7c24773fcb0d1c8fa523/20210209_movements.csv")
  (shell/sh "date"))