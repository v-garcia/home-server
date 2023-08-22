#!/usr/bin/env bb

(require
 '[cheshire.core :as json]
 '[babashka.http-client :as http]
 '[babashka.http-client.websocket :as ws]
 '[clojure.string :as str])

(def env #(System/getenv %))

(defn retrieve-applications-names 
  []
  (->>
   (http/request {
                 :method :get
                 :uri (format "http://%s/application" (env "GOTIFY_HOST")) 
                 :headers {"X-Gotify-Key" (env "GOTIFY_TOKEN")}})
   :body
   json/parse-string
   (map (fn [app] [(get app "id") (get app "name")]))
   (into {})))

(def application-names 
  (delay (retrieve-applications-names)))

(defn send-ntfy-message
  [gtfy-msg]
  (http/request {:method :post
                 :uri "https://ntfy.sh"
                 :body (json/generate-string gtfy-msg)}))

(defn application-name->topic-name
  [app-name]
  (str
   (env "NTFY_TOPICS_PREFIX")
   "_"
   (str/replace (str/lower-case app-name) #" " "-")))

(defn gotify-msg->ntfy-msg
  [gtfy-app-id->name gtfy-msg]
  {:priority (-> (:priority gtfy-msg) (max 1) (min 5)) ; https://docs.ntfy.sh/publish/#message-priority
   :title    (:title gtfy-msg)
   :topic    (application-name->topic-name (get gtfy-app-id->name (:appid gtfy-msg) "unknown"))
   :message  (:message gtfy-msg)})

(defn listen-gotify-events
  []
  (println (format "Try to listen %s" (format "ws://%s/stream" (env "GOTIFY_HOST"))))
  (ws/websocket
   {:uri (format "ws://%s/stream" (env "GOTIFY_HOST"))
    :headers {"X-Gotify-Key" (env "GOTIFY_TOKEN")}
    :on-message (fn [_ gtfy-msg _]
                  (try (let [gtfy-msg   (json/parse-string (str gtfy-msg) keyword)
                             _          (println gtfy-msg)
                             ntfy-msg   (gotify-msg->ntfy-msg @application-names gtfy-msg)]
                         (println ntfy-msg)
                         (send-ntfy-message ntfy-msg)
                         )
                       (catch Exception e
                         (println "Error on websocket:on-message" e))))}))


(println "Run gotify-to-ntfy-bridge")
 (loop [ws nil]
   (recur
   (try
     (or ws (listen-gotify-events)) 
     (catch Exception e
       (println "Error while trying to listen gotify websocket, will retry" e))
     (finally (Thread/sleep 30000)))))