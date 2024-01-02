# PanTaGruEl Application

## Context

PanTaGruEl application is written in [Angular CLI](https://github.com/angular/angular-cli) version 15.2.4 created by Gwenaëlle Gustin as part of a bachelor of science project at the [HES-SO Valais Wallis](https://www.hevs.ch/fr/hautes-ecoles/haute-ecole-de-gestion/informatique-de-gestion/formation-bachelor-en-informatique-de-gestion-200049), supervised by the teacher David Wannier. The goal is to represent and manipulate data of PanTaGruEl.

The written work related to this application is available in French [here](https://sonar.rero.ch/hesso/documents/326901) under the name "Développment d'une interface user friendly pour le pilotage de simulation de réseau électrique intelligent".

## Technical info

PanTaGruEl is a dynamical grid model designed to investigate the propagation of disturbances in the continental European transmission grid ([Zenodo](https://zenodo.org/record/2642175#.ZFYm-HZBy3D)), created by Prof. Philippe Jacquod (responsible of [Electrical Energy Efficiency Group - GEEE](https://etranselec.ch/)) and Laurent Pagnier, and improve by Julian Fritzsch.

The application displays data from the [API NetworkServer.jl](https://github.com/julianfritzsch/NetworkServer.jl) written in Julia by Julian Fritzsch (member of the GEEE), which itself uses the Pantagruel Julia project [PanTaGruEl.jl](https://github.com/laurentpagnier/pantagruel.jl).


- **The running application can be tested here https://etranselec.ch/pantafrontend/.**
- The version under development is linked to https://pantagruel-frontend-dev.netlify.app/
- You can find example of a generate scenario at https://etranselec.ch/pantafrontend/?scenario=2023-07-13-11-19-32Change-Kriegers-Flak.json

## Usage

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build
Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.


### Deploy
Run `ng build --configuration production --base-href=\"https://etranselec.ch/pantafrontend/"` to build the project. The build artifacts will be stored in the `docs/` directory. Push the new version to dev branch and create a pull request.

The code on the dev branch is automatically deployed on https://pantagruel-frontend-dev.netlify.app/
After pull request acceptance, 

## Release note
### 1.0.3 (01.2024)
**New features:**
- Number version displayed
  
**Bug fix**
- Local default data is now available again

### 1.0.2 (12.2023)
**New features:**
- A JSON file can be uploaded to replace default grid
- JSON file with grid data can be downloaded
- Dev mode replaced by Localhost mode (local api) and Advanced mode (raw data)
- 
**Bug fix**
- Hide NaN value

### 1.0.1 (08-11.2023)
**New features:**
- Application call local api (http://127.0.0.1:8080/) in local host mode
  
**Bug fix:**
- Limit date fixed dynamically
- List of edits after recalculate

### 1.0.0 (07-2023)
- Version at the end of Bachelor. Everything is described [here](https://sonar.rero.ch/hesso/documents/326901) from page 76 to 79.
