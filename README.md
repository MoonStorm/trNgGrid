### trNgGrid is a feature rich data grid based on the popular AngularJs framework and making use of plain HTML table elements.

#### Why another one?
Simply because everything else you're gonna find out there:
- is breaking the separation of concerns, forcing you to set it up inside your controller, and not inside the view.
- is using DIVs instead of the elements meant to display tabular data, hence performing poorly and also turning the rendered markup into spaghetti.
- is over-engineered without giving you anything extra in return, making it difficult to maintain.

#### Why this one?
- is easy to use.
- is using plain tables, allowing the browsers to optimize the rendering for performance.
- allows you to fully describe it in a view, without messing up your controllers.
- is customizable via templates and two-way data bound attributes.
- is easy to maintain, as its code was written under the type safe TypeScript. The repository also has the pure JS implementation, so no need to worry if you don't want to learn a new technology (even though I strongly recommend this one).

#### Documentation and demo site
 - [Release](http://moonstorm.github.io/trNgGrid/release)

#### Limitations
Not everything is sweet and wonderful though. There are a few limitations which you should be aware of before jumping in.
- Multiple `TR` rows in the table definition are not supported. In other words, you can't have more than one row per header, footer, or per data item.
- Any kind of attributes on the `TR` rows, including Angular directives or styles, are ignored. You are free to customize your cells though in any way you want.
- You can't use the `data-` notation for the attributes.
- Custom start/end symbols, set up via the `$interpolate` service, are not supported.
- Global configuration is not done through a provider, but through a global object. Global templates can be provided though via the template cache mechanism inside Angular.

These are some of the key complaints people have brought to my attention and I'm trying hard to address them in the next major release.

If you want to show your support and help keep the flame burning, <a href='https://pledgie.com/campaigns/28572'><img alt='Click here to lend your support to: trNgGrid and make a donation at pledgie.com !' src='https://pledgie.com/campaigns/28572.png?skin_name=chrome' border='0' ></a>

#### Convinced?
You can download the grid from the master branch, which contains the latest release. 
The files you're interested in are `trNgGrid.min.css` and `trNgGrid.min.js`. 
Make sure you first include Angular and a Boostrap theme of your choice. 
Themes can be found on the Bootswatch website. 
Of course you can craft your own, as the grid layout is quite easy to style.

#### Legend
- Release: master, gh-pages/release
- Experimental: beta, gh-pages/beta

#### Issues
 Feel free to post any problems you might experience in the `issues` section, but before you do that, fork [this simple example](http://jsfiddle.net/MoonStorm/pkuca2f8/) and attempt to isolate the issue.
 
