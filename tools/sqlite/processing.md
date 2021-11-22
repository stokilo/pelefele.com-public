# Database queries and data processing for ES

List all streets from 'Kraków-Krowodrza' and group with correct naming

```sql
select
  SU.NAZWA AS CITY,
  UU.NAZWA_1 || ' ' || COALESCE(UU.NAZWA_2, '') AS STREET,
       lower(WOJ_NAME.NAZWA) || ' ' ||
         (CASE WHEN UU.SYM_UL IS NULL THEN lower(POWIAT_NAME.NAZWA) ELSE '' END ) ||
         (CASE WHEN UU.SYM_UL IS NULL THEN ' ' ELSE '' END) ||
         SU.NAZWA || ' '  || COALESCE(UU.NAZWA_1, '') || ' ' || COALESCE(UU.NAZWA_2, '')
       AS LOCATION_NAME,
       SU.SYM || (CASE WHEN UU.SYM_UL IS NOT NULL  THEN '-' ELSE '' END ) || COALESCE(UU.SYM_UL, '') AS LOCATION_ID
from SIMC_URZEDOWY SU
left join ULIC_URZEDOWY UU on SU.SYM = UU.SYM
join NTS WOJ_NAME ON WOJ_NAME.WOJ = SU.WOJ
join NTS POWIAT_NAME ON POWIAT_NAME.WOJ = SU.WOJ
     and POWIAT_NAME.POW=SU.POW and POWIAT_NAME.GMI = SU.GMI and POWIAT_NAME.RODZ=SU.RODZ_GMI
where
  WOJ_NAME.PODREG is null and WOJ_NAME.GMI is null
```

Run query below and export as CSV. This is a data for ES import for address index.
```sql

select
    UU.NAZWA_1 || ' ' || COALESCE(UU.NAZWA_2, '')AS STREET,
    SU.NAZWA AS CITY,
    SU.WOJ,
    SU.POW,
    SU.GMI,
    SU.MZ,
    SU.RM,
    lower(WOJ_NAME.NAZWA) || ' ' || lower(POWIAT_NAME.NAZWA) || ' ' || SU.NAZWA || ' ' || COALESCE(UU.NAZWA_1, '') ||
    ' ' || COALESCE(UU.NAZWA_2, '')                                                                                AS LOCATION_NAME_V1,
    lower(WOJ_NAME.NAZWA) || ' ' || SU.NAZWA || ' ' || COALESCE(UU.NAZWA_1, '') || ' ' ||
    COALESCE(UU.NAZWA_2, '')                                                                                       AS LOCATION_NAME_V2,
    lower(WOJ_NAME.NAZWA) || ' ' ||
    (CASE WHEN UU.SYM_UL IS NULL THEN lower(POWIAT_NAME.NAZWA) ELSE '' END) ||
    (CASE WHEN UU.SYM_UL IS NULL THEN ' ' ELSE '' END) ||
    SU.NAZWA || ' ' || COALESCE(UU.NAZWA_1, '') || ' ' ||
    COALESCE(UU.NAZWA_2, '')                                                                                       AS LOCATION_NAME_V3,
    SU.SYM || (CASE WHEN UU.SYM_UL IS NOT NULL THEN '-' ELSE '' END) ||
    COALESCE(UU.SYM_UL, '')                                                                                        AS LOCATION_ID,
    SU.WOJ || '-' || SU.POW || '-' || SU.GMI || '-' || SU.SYM ||
    (CASE WHEN UU.SYM_UL IS NOT NULL THEN '-' ELSE '' END) ||
    COALESCE(UU.SYM_UL, '')                                                                                        AS FULL_LOCATION_ID
from SIMC_URZEDOWY SU
         left join ULIC_URZEDOWY UU on SU.SYM = UU.SYM
         join NTS WOJ_NAME ON WOJ_NAME.WOJ = SU.WOJ
         join NTS POWIAT_NAME ON POWIAT_NAME.WOJ = SU.WOJ
    and POWIAT_NAME.POW = SU.POW and POWIAT_NAME.GMI = SU.GMI and POWIAT_NAME.RODZ = SU.RODZ_GMI
where WOJ_NAME.PODREG is null
  and WOJ_NAME.GMI is null
--   AND SU.NAZWA like '%Tuchów%'
  AND RM NOT IN (99)               -- exclude 'czesc miasta' -> nie ma relacji ulica-czesc miasta w bazie
  AND RM NOT IN (7, 6, 4, 3, 2, 0) -- exclude others
UNION ALL
select
    '' AS STREET,
    SU.NAZWA AS CITY,
    SU.WOJ,
    SU.POW,
    SU.GMI,
    SU.MZ,
    SU.RM,
    lower(WOJ_NAME.NAZWA) || ' ' || lower(POWIAT_NAME.NAZWA) || ' ' || SU.NAZWA || ' ' AS LOCATION_NAME_V1,
    lower(WOJ_NAME.NAZWA) || ' ' || SU.NAZWA                                           AS LOCATION_NAME_V2,
    lower(WOJ_NAME.NAZWA) || ' ' || SU.NAZWA                                           AS LOCATION_NAME_V3,
    SU.SYM                                                                             AS LOCATION_ID,
    SU.WOJ || '-' || SU.POW || '-' || SU.GMI || '-' || SU.SYM                          AS FULL_LOCATION_ID
from SIMC_URZEDOWY SU
         join NTS WOJ_NAME ON WOJ_NAME.WOJ = SU.WOJ
         join NTS POWIAT_NAME ON POWIAT_NAME.WOJ = SU.WOJ
    and POWIAT_NAME.POW = SU.POW and POWIAT_NAME.GMI = SU.GMI and POWIAT_NAME.RODZ = SU.RODZ_GMI
where WOJ_NAME.PODREG is null
  and WOJ_NAME.GMI is null
--   AND SU.NAZWA like '%Tuchów%'
  AND RM IN (95, 96, 98, 99, 1) -- miasta, delegatury, wsie



```
