(ns wallet-monitor.s3
  (:require
   [amazonica.aws.s3 :as s3]))

(defn put-object-from-str!
  [bucket key value &
   {:keys [:charset :content-type] :or {charset "UTF-8" content-type "text/plain"}}]
  (let [b  (.getBytes value charset)
        is (java.io.ByteArrayInputStream. b)]
    (s3/put-object
     {:endpoint (System/getenv "AWS_S3_ENDPOINT")}
     :bucket-name bucket
     :key key
     :metadata {:content-length (count b) :content-type content-type}
     :input-stream is)))

(defn get-object-as-str!
  [bucket key &
   {:keys [:charset] :or {charset "UTF-8"}}]
  (->
   (s3/get-object {:endpoint (System/getenv "AWS_S3_ENDPOINT")}
                  :bucket-name bucket
                  :key key)
   :input-stream (slurp :encoding charset)))
