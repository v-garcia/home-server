(ns wallet-monitor.boursedirect)

(def stocks
  {"LU1681038672" {:libelle "AMUNDI RUSSEL 2K"
                   :mnemo "RS2K"
                   :explain "US: Petite capitalisations"}
   "FR0010688192" {:libelle "AMUNDI ETF MSCI EUROPE HEALTHCAR"
                   :mnemo "CH5"
                   :explain "EUR, Santé"}
   "IE00B945VV12" {:libelle "VANGUARD FUNDS PLC VANGUARD FT"
                   :mnemo "VEUR"
                   :explain "EUR: Moyenne capitalisation"}

   "FR0013412020" {:libelle "AMUNDI ETF MSCI EMERGING MARKETS"
                   :mnemo "PAEEM"
                   :explain "Pays emergents: Grosse capitalisation"}
   "FR0011869304" {:libelle "LYXOR FEN DVEU PEA"
                   :mnemo "PMEH"
                   :explain "EUR: Immobilier"}
   "FR0013412285" {:libelle "AMUNDI PEA SP500"
                   :mnemo "PE500"
                   :explain "US: Grosse capitalisation"}
   "LU1377382285" {:libelle "BNPP Value EU"
                   :mnemo "EVAE"
                   :explain "EUR: Sociétés sous-évaluées"}

   ; Removed
   "FR0010688168" {:libelle "AMUNDI PEA SP500"
                   :mnemo "CS5"
                   :explain "EUR: Biens de conso courantes"}
   "FR0010900076" {:libelle "AMUNDI ETF E SM CP"
                   :mnemo "ESM"
                   :explain "EUR: Petite capitalisation"}

    ; Added 09/10/2020
   "LU1834985845" {:libelle "LYXOR STX EU FO BE"
                   :mnemo "FOO"
                   :explain "EUR: Biens de conso courantes"}
   "LU1681041544" {:libelle "AMUNDI ETF EUR MID "
                   :mnemo "CEM"
                   :explain "EUR: Petite capitalisation"}})


