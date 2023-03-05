#!/usr/bin/env bb

(require '[babashka.http-client :as http]
         '[cheshire.core :as json]
         '[clojure.core.async :as a]
         '[clojure.data.csv :as csv]
         '[clojure.string :as str])

(def env #(System/getenv %))

(defn influx-request [& {:as q}]
  (->
   (cond-> q (:body q) (update :body json/encode))
   (update :uri #(str (env "INFLUX_HOST")  "/api/v2" %))
   (update :headers #(assoc % "Authorization" (str "Token " (env "INFLUX_TOKEN"))))
   http/request
   (update :body #(try (json/parse-string % keyword) (catch Exception _ %)))))

(defn csv-data->maps [csv-data]
  (map zipmap
       (->> (first csv-data)
            (map keyword)
            repeat)
       (rest csv-data)))

(def query
  "from(bucket: \"_monitoring\")
    |> range(start: -30m, stop: now())
    |> filter(fn: (r) => r[\"_measurement\"] == \"statuses\")
    |> filter(fn: (r) =>  r[\"_field\"] == \"_message\")
    |> yield()")

(defn get-notif-key
  [notif]
  [(get notif :_check_name)
   (some #(get notif %) [:deviceId])])

(defn get-last-checks
  []
  (->>  (influx-request
         :uri     (str "/query?orgID=" (env "ORG_ID"))
         :method  :post
         :body    {:query        query})
        :body
        csv/read-csv
        (map (comp rest rest))
        butlast
        csv-data->maps
        (sort-by :_time)
        (map #(assoc % ::id (get-notif-key %)))))

(defn send-gotify-notif!
  [title message & {:keys [:priority] :or {priority 1}}]
  (->>
   {:title title :message message :priority priority}
   json/encode
   (hash-map
    :throw   false
    :uri     (str (env "GOTIFY_URL") "/message")
    :method  :post
    :headers {"X-Gotify-Key" (env "GOTIFY_TOKEN")
              "Content-Type" "application/json"}
    :body)
   http/request))

(defn send-notifs!
  [influx-notifs]
  (mapv (fn [{:keys [::id :_level :_check_name :_value]}]
          (let [{:keys [:status :body]}           (send-gotify-notif!
                                                   (str _check_name " went '" _level "'")
                                                   _value)
                sent?                             (#{\2 \3} (first (str status)))]
            (when-not sent? (println body))
            [id sent?]))
        influx-notifs))

(defn set-interval
  [f time-in-ms]
  (let [stop (a/chan)]
    (a/go-loop []
      (a/alt!
        (a/timeout time-in-ms) (do (a/<! (a/thread (f)))
                                   (recur))
        stop :stop))
    stop))

;; App state
(def state (atom {:last-vals {} :notifs '()}))

;; Watch checks for state change
(def ch-checks
  (set-interval
   (fn []
     (let [last-checks (get-last-checks)]
       (swap! state
              (fn [v]
                (reduce (fn [state {:keys [::id :_level :_time] :as check}]
                          (let [new?            (pos? (compare _time (get-in state [:last-vals id 0])))
                                lvl-changed?    (some-> state (get-in [:last-vals id 1]) (not= _level))]
                            (cond-> state
                              new?                    (assoc-in [:last-vals id] [_time _level])
                              (and new? lvl-changed?) (update :notifs conj check)))) v last-checks)))))
   (* 50 1000)))

;; Send notifs to gotify
(def ch-gotify
  (set-interval
   (fn []
     (let [id->sent? (->> (get @state :notifs '()) send-notifs! (into {}))]
       (swap! state
              (fn [v] (update v :notifs (partial remove (comp id->sent? ::id))))))), (* 10 1000)))

(defn -main 
  [& _]
  (println "Influx notifs main started")
  (while true
    (let [{:keys [:last-vals :notifs]} @state]
      (println (format "Statuses: %s, Notifs to send: %s" 
        (count notifs)
        (str/join ", " (->> last-vals (map (comp last last)) frequencies
                             (map (fn [[k v]] (str k "=>" v))))))))
    
    (Thread/sleep (* 5 60 1000))))

(-main)

(comment
 (a/close! ch-checks)
 (a/close! ch-gotify))