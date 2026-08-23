#!/usr/bin/env bb

(require '[babashka.http-client :as http]
         '[cheshire.core :as json]
         '[clojure.string :as str]
         '[clojure.java.io :as io] 
         )

(def env #(System/getenv %))

(defn influx-request [& {:as q}]
  (->
   (cond-> q (:body q) (update :body json/encode))
   (update :uri #(str (env "INFLUX_HOST")  "/api/v2" %))
   (update :headers #(assoc % "Authorization" (str "Token " (env "INFLUX_TOKEN"))))
   http/request
   (update :body #(try (json/parse-string % keyword) (catch Exception _ %)))))

(def task-description->id (->>
                           (get-in (influx-request :uri "/tasks" :method :get) [:body :tasks])
                           (map (juxt :description :id))
                           (into {})))

(defn file->description
  [file]
  (.getName file))

(defn create-task [description flux]
  (influx-request
           :uri     "/tasks"
           :method  :post
           :body    {:orgID       (env "ORG_ID")
                     :flux        flux
                     :description description}))

(defn update-task [id flux]
  (influx-request
   :uri     (str "/tasks/" id)
   :method  :patch
   :body    {:flux  flux}))

(println "Run create tasks")

(def flux-dir (io/file (or (env "FLUX_DIR") "/data/")))
(def task-dir (io/file flux-dir "tasks"))

(when-not (.exists flux-dir)
  (println (str flux-dir " folder does not exists"))
  (System/exit 1))

(doseq [f (filter #(re-matches #"(?!.*(\.draft|\.dev)\.flux$).*\.flux$" (str %)) (.listFiles task-dir))]
  (try
    (let [description (file->description f)
          flux        (slurp f)]
      @(if-let [id (task-description->id description)]
         (do (println "Update file " description " at " id)
             (update-task id flux))
         (do (println "Create file " description)
             (create-task description flux))))
    (catch Exception e (str "caught exception for file: " f " : " (.getMessage e)))))

(System/exit 0)

(comment 
 (create-task "zigbee_deadman.flux" (slurp "./data/tasks/zigbee_deadman.flux")) 
)