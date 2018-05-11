## THIS PROJECT IS NO LONGER MAINTAINED AND HAS BEEN ARCHIVED.

trNgGrid can be used for simple to mildly complex scenarios where you quickly need a data grid with a decent amount of features, which is easy to learn and to hook up with your data models thanks to its powerful data binding properties. All the configuration parameters can be set directly inside the view, hence you won't muddy your Angular scopes or controllers with configuration details.

<b>For more complex scenarios and more fine tuned control, I recommend trying out [Smart Table](http://lorenzofox3.github.io/smart-table-website/) or forking trNgGrid and tweaking it to suit your needs.</b>

#### [Documentation and demo site](http://moonstorm.github.io/trNgGrid/release)

#### Installation
- `npm install tr-ng-grid --save` or
- `bower install tr-ng-grid --save` or
- download the grid from the master branch, which contains the latest release. The files you're interested in are `trNgGrid.min.css` and `trNgGrid.min.js`. 

Make sure you first include Angular and a Boostrap theme of your choice. 
Themes can be found on the Bootswatch website. 
Of course you can craft your own, as the grid layout is quite easy to style.

#### Issues
 Feel free to [report any problems you are experiencing](https://github.com/MoonStorm/trNgGrid/issues), but before you do that, fork [this simple Plunker](http://plnkr.co/edit/JCLrJD?p=preview) and attempt to isolate the issue.
 
#### Development tips and PRs
To set up your dev environment, install npm, and then run ``npm install`` and ``bower install`` in the folder where you pulled the ``master`` branch. A VS2015 solution is included if you want to use it.
 
The source files are located in the ``typescript`` and the ``css`` folders. Running the default ``Gulp`` task will compile, minify and deploy the files into the root directory and also into a very simple sample located in the ``wwwroot`` folder. 
If you plan on sending a pull request, please don't make changes to the generated output files. 
