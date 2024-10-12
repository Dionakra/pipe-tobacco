# Tabaco de Pipa Tracker
Este proyecto monitoriza la variación de precios de los tabacos de pipa en España, obteniendo las variaciones de precios del BOE.

## Prerrequisitos
* NodeJS LTS

## Instalación
```sh
$ git clone https://github.com/Dionakra/pipe.git
$ cd pipe
$ npm install
```

## Obtención de información
El proceso se divide en dos partes:
1. Obtener las entradas del BOE que tienen información relativa a cambio de precio de tabacos.
  1. Para realizar la extracción, ejecutar `npm run boe`
  2. El proceso descarga cada HTML en la carpeta [public/html/](./public/html/).
2. En base a los BOE previamente descargados, extraer los precios de los tabacos de pipa en cada BOE.
  1. Para realizar la extracción, ejecutar `npm run parse`.
  2. Guarda la evolución de precios de Península y Baleares en el fichero [public/pb.json](./public/pb.json).
  3. Guarda la evolución de precios de Ceuta y Melilla en el fichero [public/cm.json](./public/cm.json)

## Desarrollo

```sh
$ npm run dev
```