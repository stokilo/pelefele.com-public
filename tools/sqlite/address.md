# Address data processing information

## WMRODZ
```sql
-- WMRODZ - slownik rodzajow miejscowosci
select * from WMRODZ
```

| RM | NAZWA\_RM | STAN\_NA |
| :--- | :--- | :--- |
| 0 | część | 2013-02-28 |
| 1 | wieś | 2013-02-28 |
| 2 | kolonia | 2013-02-28 |
| 3 | przysiółek | 2013-02-28 |
| 4 | osada | 2013-02-28 |
| 5 | osada leśna | 2013-02-28 |
| 6 | osiedle | 2013-02-28 |
| 7 | schronisko turystyczne | 2013-02-28 |
| 95 | dzielnica | 2013-02-28 |
| 96 | miasto | 2013-02-28 |
| 98 | delegatura | 2013-02-28 |
| 99 | część miasta | 2013-02-28 |

## NTS 
```sql
select * from NTS where NAZWA like 'Krak%'
```
| POZIOM | REGION | WOJ | PODREG | POW | GMI | RODZ | NAZWA | NAZWA\_DOD | STAN\_NA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 3 | 2 | 12 | 20 | NULL | NULL | NULL | KRAKOWSKI | podregion | 2017-01-01 |
| 3 | 2 | 12 | 21 | NULL | NULL | NULL | KRAKÓW | podregion | 2017-01-01 |
| 4 | 2 | 12 | 20 | 6 | NULL | NULL | krakowski | powiat | 2017-01-01 |
| 4 | 2 | 12 | 21 | 61 | NULL | NULL | Kraków | miasto na prawach powiatu | 2017-01-01 |
| 5 | 2 | 12 | 21 | 61 | 01 | 1 | Kraków | gmina miejska | 2017-01-01 |
| 5 | 2 | 12 | 21 | 61 | 02 | 9 | Kraków-Krowodrza | delegatura | 2017-01-01 |
| 5 | 2 | 12 | 21 | 61 | 03 | 9 | Kraków-Nowa Huta | delegatura | 2017-01-01 |
| 5 | 2 | 12 | 21 | 61 | 04 | 9 | Kraków-Podgórze | delegatura | 2017-01-01 |
| 5 | 2 | 12 | 21 | 61 | 05 | 9 | Kraków-Śródmieście | delegatura | 2017-01-01 |

## TERC
System identyfikatorów i nazw jednostek podziału terytorialnego TERC zawiera identyfikatory i nazwy jednostek zasadniczego trójstopniowego podziału terytorialnego kraju i jest zbudowany według hierarchicznej numeracji:

1. województw,

2. powiatów,

3. gmin.


W systemie odrębnymi identyfikatorami wyróżniono:

1. miasta na prawach powiatu,
3. gminy miejskie, wiejskie, miejsko-wiejskie,
5. miasta i obszary wiejskie w gminach miejsko-wiejskich,
7. dzielnice m.st. Warszawa i delegatury w miastach: Łódź, Kraków, Poznań i Wrocław.

WOJ - dwucyfrowy symbol województwa nadany województwom ułożonym w kolejności alfabetycznej z liczb parzystych w przedziale liczb 02 - 98

POW - dwucyfrowy symbol powiatu nadany powiatom danego województwa, ułożonym w kolejności alfabetycznej, a następnie miastom na prawach powiatu, odpowiednio:

1. z liczb 01 - 60 - symbol powiatu,
2. liczb 61 - 99 - symbol miasta na prawach powiatu,

GMI -  trzycyfrowy symbol gminy, w którym:

dwie pierwsze cyfry stanowią kolejne liczby w przedziale liczb 01 – 99, nadane gminom (dzielnicom, delegaturom) po ich ułożeniu w kolejności alfabetycznej w powiatach, począwszy od gmin miejskich, po nich w kolejności gminy wiejskie i miejsko-wiejskie,

trzecia cyfra stanowi symbol rodzaju jednostki i oznacza:

1. 1 – gmina miejska
2. 2 – gmina wiejska
3. 3 – gmina miejsko-wiejska
4. 4 – miasto w gminie miejsko-wiejskiej
5. 5 – obszar wiejski w gminie miejsko-wiejskiej
6. 8 – dzielnice m. st. Warszawy
7. 9 – delegatury w miastach: Kraków, Łódź, Poznań i Wrocław


```sql
-- identyfikatorów i nazw jednostek podziału terytorialnego
select * from TERC_ADRESOWY where NAZWA='Nowogrodziec'
```

| WOJ | POW | GMI | RODZ | NAZWA | NAZWA\_DOD | STAN\_NA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2 | 1 | 4 | 4 | Nowogrodziec | miasto | 2021-01-01 |
| 2 | 1 | 4 | 5 | Nowogrodziec | obszar wiejski | 2021-01-01 |



```sql
-- identyfikatorów i nazw jednostek podziału terytorialnego
select * from TERC_URZEDOWY where NAZWA='Nowogrodziec'
```

| WOJ | POW | GMI | RODZ | NAZWA | NAZWA\_DOD | STAN\_NA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2 | 1 | 4 | 3 | Nowogrodziec | gmina miejsko-wiejska | 2021-01-01 |
| 2 | 1 | 4 | 4 | Nowogrodziec | miasto | 2021-01-01 |
| 2 | 1 | 4 | 5 | Nowogrodziec | obszar wiejski | 2021-01-01 |

## SIMC

System zawiera urzędowe nazwy miejscowości, obejmuje:

1. urzędową nazwę miejscowości,
2. identyfikator miejscowości,
3. urzędowy rodzaj miejscowości,


województwo, powiat i gminę, na terenie której położona jest miejscowość
wraz z określeniem przynależności do miejscowości podstawowej,
w przypadku miejscowości niesamodzielnych, stanowiących integralną część innej miejscowości.


W systemie każdej miejscowości przypisany został rodzaj, jako
tradycyjne określenie charakteru miejscowości ukształtowanej w procesie rozwoju osadnictwa.

```sql
-- WMRODZ - slownik rodzajow miejscowosci
select * from WMRODZ
```

| RM | NAZWA\_RM | STAN\_NA |
| :--- | :--- | :--- |
| 0 | część | 2013-02-28 |
| 1 | wieś | 2013-02-28 |
| 2 | kolonia | 2013-02-28 |
| 3 | przysiółek | 2013-02-28 |
| 4 | osada | 2013-02-28 |
| 5 | osada leśna | 2013-02-28 |
| 6 | osiedle | 2013-02-28 |
| 7 | schronisko turystyczne | 2013-02-28 |
| 95 | dzielnica | 2013-02-28 |
| 96 | miasto | 2013-02-28 |
| 98 | delegatura | 2013-02-28 |
| 99 | część miasta | 2013-02-28 |


W systemie miejscowości samodzielne i niesamodzielne określa relacja identyfikatorów SYM
(identyfikator miejscowości) i SYMPOD (identyfikator miejscowości podstawowej):

miejscowość samodzielna SYM = SYMPOD

miejscowość niesamodzielna SYM ≠ SYMPOD.


Każda miejscowość wiejska tzn. każda wieś, kolonia, osada, przysiółek, itp. oraz integralna część miejscowości 
wiejskiej, a także każde miasto i część miasta otrzymały niepowtarzalny siedmiocyfrowy identyfikator.
Unikalny identifikator to kolumna SYM w tabeli ponizej.


```sql
-- identyfikatorów i nazw miejscowości
select * from SIMC_ADRESOWY where NAZWA='Nowogrodziec'
```
| WOJ | POW | GMI | RODZ\_GMI | RM | MZ | NAZWA | SYM | SYMPOD | STAN\_NA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2 | 1 | 4 | 4 | 96 | 1 | Nowogrodziec | 936262 | 936262 | 2021-01-01 |


```sql
-- identyfikatorów i nazw miejscowości
select * from SIMC_URZEDOWY where NAZWA='Nowogrodziec'
```
| WOJ | POW | GMI | RODZ\_GMI | RM | MZ | NAZWA | SYM | SYMPOD | STAN\_NA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2 | 1 | 4 | 4 | 96 | 1 | Nowogrodziec | 936262 | 936262 | 2021-01-01 |

## ULIC

Katalog ulic stanowi ogólnopolski zbiór ulic przypisanych do miejscowości w ramach jednostek podziału terytorialnego.
Podstawą utworzenia katalogu był alfabetyczny wykaz wszystkich niepowtarzalnych nazw ulic występujących w Polsce.
Każdej nazwie w katalogu przyporządkowana została cecha, tj. określenie typu: ulica, aleja, plac, skwer, bulwar itp.
a unikalnej parze: [cecha] +[nazwa ulicy] został nadany pięciocyfrowy identyfikator. 

Ulice o takiej samej nazwie i cesze, występujące w różnych miejscowościach mają ten sam identyfikator.
Jednakowe nazwy ulic różniące się cechą oznaczane są odrębnymi identyfikatorami.


Lista cech występujących w katalogu ulic:

ul. (ulica), al. (aleja), pl. (plac), skwer, bulw. (bulwar), rondo, park, rynek, szosa, droga,
os.(osiedle), ogród, wyspa, wyb. (wybrzeże), inne.

Cecha „inne” dotyczy w szczególności sytuacji gdy:

charakter obiektu nie został odzwierciedlony na liście cech (np. wiadukt, dworzec, stacja itp.),

w wyniku zmian administracyjnych przyłączono do miasta teren wiejski, na którym nie występuje sieć ulic 
i nowe nazwy nie zostały jeszcze nadane, a do zapisu adresów budynków urząd gminy wykorzystuje
nazwy występujących tam wcześniej miejscowości wiejskich.

```sql
select * from ULIC_ADRESOWY where NAZWA_1 like 'Lea'
```
| WOJ | POW | GMI | RODZ\_GMI | SYM | SYM\_UL | CECHA | NAZWA\_1 | NAZWA\_2 | STAN\_NA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 12 | 61 | 2 | 9 | 950470 | 10731 | ul. | Lea | Juliusza | 2021-11-12 |
| 12 | 3 | 1 | 5 | 314661 | 10731 | ul. | Lea | Juliusza | 2021-11-12 |

```sql
select * from ULIC_URZEDOWY where NAZWA_1 like 'Lea'
```
| WOJ | POW | GMI | RODZ\_GMI | SYM | SYM\_UL | CECHA | NAZWA\_1 | NAZWA\_2 | STAN\_NA |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 12 | 61 | 2 | 9 | 950470 | 10731 | ul. | Lea | Juliusza | 2021-11-12 |
| 12 | 3 | 1 | 5 | 314661 | 10731 | ul. | Lea | Juliusza | 2021-11-12 |

W ponizszym przykladzie zauwaz ze SYM_UL jest taki sam dla ulic nalezacych do roznych
miejscowosci (SYM).

```sql
select * from ULIC_ADRESOWY where NAZWA_1 like 'Zwierzyniecka'
```

| WOJ | POW | GMI | RODZ\_GMI | SYM | SYM\_UL | CECHA | NAZWA\_1 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 2 | 15 | 1 | 1 | 987259 | 26305 | ul. | Zwierzyniecka |
| 4 | 61 | 1 | 1 | 928363 | 26305 | ul. | Zwierzyniecka |
| 2 | 19 | 1 | 1 | 984657 | 26305 | ul. | Zwierzyniecka |
| 6 | 20 | 13 | 4 | 987934 | 26305 | ul. | Zwierzyniecka |
| 10 | 63 | 1 | 1 | 976942 | 26305 | ul. | Zwierzyniecka |
| 10 | 16 | 1 | 1 | 968300 | 26305 | ul. | Zwierzyniecka |
