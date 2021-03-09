## UI for project AGCCS-CTRL22

This programm aims to develop the user interface for the Combined Charging System from project AGCCS. A supporting server program is needed for regular operation.

The whole work is developed based on Vue.js and uses Element UI as the UI toolkit. Now it has the following 3 main functions:

1. Main console: Check the data of the whole charging mesh, which includes the total and active numbers of charging nodes, the total current value in 3 phases and the setting of mesh.
2. Console of node: Check the status of every node, which includes the settings, connection and status and current value in each phase, and change settings of node.
3. Side menu: switch the console, edit the setting of mesh.

### Guidelines for Installation


##### Development environment
nodejs v14.15.3 and npm v6.14.10 (compatibility of lower version hasn't been tested)

##### Project setup
```
npm install
```
##### Compiles and hot-reloads for development
```
npm run serve
```
##### Compiles and minifies for production
```
npm run build
Then copy the folder dist into the server folder.
```
##### Lints and fixes files
```
npm run lint
```
