# PanTaGruEl Application

## Description

PanTaGruEl application is written in [Angular CLI](https://github.com/angular/angular-cli) version 15.2.4 created by Gwenaëlle Gustin as part of a bachelor of science project at the [HES-SO Valais Wallis](https://www.hevs.ch/fr/hautes-ecoles/haute-ecole-de-gestion/informatique-de-gestion/formation-bachelor-en-informatique-de-gestion-200049), supervised by the teacher David Wannier. The goal is to represent and manipulate data of PanTaGruEl.

PanTaGruEl is a dynamical grid model designed to investigate the propagation of disturbances in the continental European transmission grid ([Zenodo](https://zenodo.org/record/2642175#.ZFYm-HZBy3D)), created by Prof. Philippe Jacquod (responsible of [Electrical Energy Efficiency Group - GEEE](https://etranselec.ch/)) and Laurent Pagnier, and improve by Julian Fritzsch.

The application displays data from the [API NetworkServer.jl](https://github.com/julianfritzsch/NetworkServer.jl) written in Julia by Julian Fritzsch (member of the GEEE), which itself uses the Pantagruel Julia project [PanTaGruEl.jl](https://github.com/laurentpagnier/pantagruel.jl).

The application is deployed on 3 websites:
- Dev branch is linked to https://pantagruel-frontend-dev.netlify.app/
- Main branch is linked to https://pantagruel-frontend.netlify.app/
- The version finished at the end of the bachelor period on https://etranselec.ch/pantafrontend/

You can find example of a generate scenario at https://etranselec.ch/pantafrontend/?scenario=2023-07-13-11-19-32Change-Kriegers-Flak.json

The written work related to this application will be available (if the grade is sufficient) under the name "Développment d'une interface user friendly pour le pilotage de simulation de réseau électrique intelligent".

## Usage

### Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.


### Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.



