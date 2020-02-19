(ns wallet-monitor.boursedirect)

(def stocks
  {"LU1681038672" {:libelle "AMUNDI RUSSEL 2K"
                   :mnemo "RS2K"
                   :explain "Petite capitalisations, indice US"}
   "FR0010688168" {:libelle "AMUNDI PEA SP500"
                   :mnemo "CS5"
                   :explain "Biens de conso courantes, indice EUR (40 valeurs)"}
   "FR0010688192" {:libelle "AMUNDI ETF MSCI EUROPE HEALTHCAR"
                   :mnemo "CH5"
                   :explain "Santé, indice EUR (30 valeurs)"}
   "IE00B945VV12" {:libelle "VANGUARD FUNDS PLC VANGUARD FT"
                   :mnemo "VEUR"
                   :explain "Moyenne capitalisation, indice EUR"}
   "FR0010900076" {:libelle "AMUNDI ETF E SM CP"
                   :mnemo "ESM"
                   :explain "Petite capitalisation, indice EUR"}
   "FR0013412020" {:libelle "AMUNDI ETF MSCI EMERGING MARKETS"
                   :mnemo "PAEEM"
                   :explain "Grosse capitalisation, pays émergents"}
   "FR0011869304" {:libelle "LYXOR FEN DVEU PEA"
                   :mnemo "PMEH"
                   :explain "Immobilier europe"}
   "FR0013412285" {:libelle "AMUNDI PEA SP500"
                   :mnemo "PE500"
                   :explain "Grosse capitalisation, US"}
   "LU1377382285" {:libelle "BNPP Value EU"
                   :mnemo "EVAE"
                   :explain "Sociétés sous-évaluées, EUR"}})

