(ns wallet-monitor.utils
  (:require
   [java-time :as t]))


(defn working-yesterday
  ([from-day]
   (let
    [yesterday (t/minus from-day (t/days 1))
     dow       (t/day-of-week yesterday)]
     (if
      (or
       (= dow
          (t/day-of-week :sunday))
       (= dow
          (t/day-of-week :saturday)))
       (working-yesterday yesterday)
       yesterday)))
  ([] (working-yesterday (t/local-date))))
