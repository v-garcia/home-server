#!/usr/bin/env bb

(require
 '[cheshire.core :as json]
 '[clojure.java.shell :as shell]
 '[babashka.http-client :as http])

(def env #(System/getenv %))

(defn execute-command [command]
  (let [result (shell/sh "bash" "-c" command)]
    (when (not= (:exit result) 0)
      (throw (ex-info "Command failed on command-exec" 
                                   {:command command :exit-code (:exit result)
                                    :stdout (:out result) :stderr (:err result)})))
    (:out result)))

(defn send-gotify-notif!
  [title message]
  (->>
   {:title title :message message}
   json/encode
   (hash-map
    :throw   false
    :uri     (str (env "GOTIFY_URL") "/message")
    :method  :post
    :headers {"X-Gotify-Key" (env "GOTIFY_TOKEN")
              "Content-Type" "application/json"}
    :body)
   http/request))

(defn get-older-ec2 []
  (as->
   "aws ec2 describe-instances --query \"Reservations[*].Instances[*].{InstanceId:InstanceId, LaunchTime:LaunchTime, Name:Tags[?Key=='Name'].Value | [0]}\"" %
    (execute-command %)
    (json/parse-string %)
    (map first %)
    (filter #(= "eu-boss" (get % "Name")) %)
    (sort-by #(get % "LaunchTime") %)
    (first %)))

(defn swith-notif [on?]
  (execute-command
   (format "aws codestar-notifications update-notification-rule --arn %s --status %s"
           (env "notification-rule-arn")
           (if on? "ENABLED" "DISABLED"))))


(println "Run BOSS restarter")
(try
    (let [ec2-to-kill (get-older-ec2)]
    (println "Ec2 to stop: " ec2-to-kill)
    (swith-notif false)
    (execute-command (format "aws ec2 terminate-instances  --instance-ids %s" (get ec2-to-kill "InstanceId")))
    (println "Instance terminated, waiting 8mn")
    (Thread/sleep (* 8 60 1000))
    (swith-notif true) 
    (println "End BOSS restarter"))
  (catch Exception e
    (str "Caught exception: " (.getMessage e))
    (send-gotify-notif! "BOSS restarter handled exception" (.getMessage e))))