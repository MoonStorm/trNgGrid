### trNgGrid is a feature rich data grid based on the popular AngularJs framework and making use of plain HTML table elements.

#### Why another one?
Simply because everything else you're gonna find out there is either:
- breaking the separation of concerns, forcing you to initialize it inside a controller, and not inside the view
- using DIVs instead of the elements meant to display tabular data, hence performing poorly and, as a bonus, turning the rendered markup into spaghetti
- over-engineered without giving you much in return, making it just difficult to maintain
- quite pricey
- bringing along bloated old dependencies for the ride
     
#### Why this one?
- is simple to use
- spits out plain HTML table elements, meant to be used for displaying tabular data, thus helping the browsers to optimize the rendering
- allows you to fully describe it in a view, without messing up your controllers with elaborate configs
- fully customizable via templates and two-way data bound attributes
- easy to maintain, as its code was written in TypeScript. The repository also has the JS implementation, so no need to worry if you don't have time to learn something new (even though I strongly recommend this one as it brings a bit of order in the Javascript chaos)
- has a very short list of dependencies: Angular and Bootstrap CSS
- it's far from perfection, but it's actively being maintained and improved

#### [Documentation and demo site](http://moonstorm.github.io/trNgGrid/release)

#### Convinced?
You can install the grid by either:
- running `npm install tr-ng-grid --save` or
- running `bower install tr-ng-grid --save` or
- downloading the grid from the master branch, which contains the latest release. The files you're interested in are `trNgGrid.min.css` and `trNgGrid.min.js`. 

Make sure you first include Angular and a Boostrap theme of your choice. 
Themes can be found on the Bootswatch website. 
Of course you can craft your own, as the grid layout is quite easy to style.

If you want to show your support and help keep the flame burning, please [![donate](https://pledgie.com/campaigns/28572.png?skin_name=chrome)](https://pledgie.com/campaigns/28572)

#### Legend
- Release: master, gh-pages/release
- Experimental: beta, gh-pages/beta

#### Issues
 Feel free to [report any problems you are experiencing](https://github.com/MoonStorm/trNgGrid/issues), but before you do that, fork [this simple Plunker](http://plnkr.co/edit/JCLrJD?p=preview) and attempt to isolate the issue.
 
