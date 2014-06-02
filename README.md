### trNgGrid is a feature rich data grid based on the popular AngularJs framework and making use of plain simple table HTML elements.

#### [Documentation and demo site](http://moonstorm.github.io/trNgGrid/)

#### Why another one?

Simply because everything else you're gonna find out there:
- is breaking the separation of concerns, forcing you to initialize it inside a controller, and not inside the view.
- is using DIVs instead of elements meant to display tabular data, hence giving poor performance.
- is over-engineered without giving you anything extra in return, making difficult to maintain.

#### Why this one?
- is built with simplicity in mind.
- is using plain tables, allowing the browsers to optimize the rendering for performance.
- allows you to fully describe it in a view, without messing up your controllers.
- is fully customizable via two-way data bound attributes and templates.
- easy to maintain, as its code was written under the type safe TypeScript. The repository also has the pure JS implementation, so no need to worry if you don't want to learn a new technology (even though I strongly recommend you do).

#### Convinced?
You can download the grid from the release folder. Make sure you also include JQuery, Angular, and a Boostrap theme of your choice. Themes can be found on the Bootswatch website. Of course you can craft your own, as the grid layout is quite easy to style.

