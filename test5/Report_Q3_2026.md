# Report Trimestrale - Q3 2026

Andamento vendite e flusso operativo

Nel terzo trimestre le vendite sono cresciute del 12% rispetto al periodo precedente. La tabella riporta il dettaglio per regione, mentre il diagramma mostra il flusso di approvazione degli ordini.

<table><tr><td>Regione</td><td>Unita vendute</td><td>Ricavo (EUR)</td></tr><tr><td>Nord</td><td>120</td><td>45.000</td></tr><tr><td>Centro</td><td>80</td><td>30.500</td></tr><tr><td>Sud</td><td>60</td><td>22.000</td></tr></table>

![image](imgs/Report_Q3_2026_page_001/004_img_in_image_box_116_595_1032_683.png)

## Diagramma di flusso (dal diagramma)

```mermaid
flowchart LR
    N1["Richiesta"] --> N2["Analisi"]
    N2["Analisi"] --> N3["Approvazione"]
    N3["Approvazione"] --> N4["Consegna"]
```


*Pipeline: Acquisizione -> Estrazione -> Validazione -> Archivio*

![image](imgs/Report_Q3_2026_page_001/006_img_in_image_box_197_870_723_1199.png)

## Diagramma di flusso (ricostruito da frecce riconosciute)

```mermaid
flowchart LR
    N1["Pipeline: Acquisizione"] --> N2["Estrazione"]
    N2["Estrazione"] --> N3["Validazione"]
    N3["Validazione"] --> N4["Archivio"]
```
