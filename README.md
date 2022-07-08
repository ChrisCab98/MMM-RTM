# MMM-RTM
Displays real time publics transports departure in Marseille (France)

![Capture d’écran 2022-06-27 à 14 37 41 (2)](https://user-images.githubusercontent.com/54483988/177638383-e21d9743-406b-4d0d-89f9-56670cf4dc76.png)

## Configuration Sample
```
{
  module: "RTM",
  position: "top_left",
  config: {
    line : [
      {"pointRef" : "00003493", "linePublicCode" : "M1"},
      {"pointRef" : "00000933", "linePublicCode" : "9"},
    ]
  }
},
```
