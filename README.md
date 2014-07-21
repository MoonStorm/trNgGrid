### trNgGrid is a feature rich data grid based on the popular AngularJs framework and making use of plain simple HTML table elements.

#### [Documentation and demo site](http://moonstorm.github.io/trNgGrid/)

#### Why another one?

Simply because everything else you're gonna find out there:
- is breaking the separation of concerns, forcing you to set it up inside your controller, and not inside the view.
- is using DIVs instead of the elements meant to display tabular data, hence performing poorly and also turning the rendered markup into spaghetti.
- is over-engineered without giving you anything extra in return, making it difficult to maintain.

#### Why this one?
- is built with simplicity in mind.
- is using plain tables, allowing the browsers to optimize the rendering for performance.
- allows you to fully describe it in a view, without messing up your controllers.
- is fully customizable via templates and two-way data bound attributes.
- easy to maintain, as its code was written under the type safe TypeScript. The repository also has the pure JS implementation, so no need to worry if you don't want to learn a new technology (even though I strongly recommend this one).

#### Convinced?
You can download the grid from the `release` or `beta` folder in the master branch. Make sure you also include JQuery (dropped as a dependency in beta), Angular, and a Boostrap theme of your choice. Themes can be found on the Bootswatch website. Of course you can craft your own, as the grid layout is quite easy to style.

##### Legend
- master/release : stable
- master/beta : BETA
- gh-pages: DEMO site
- dev: broken in a million pieces

##### Change Log
###### 3.0 Beta
- Multiple types of selection.
- Ability to override the default CSS and templates.
- Better handling of various elements in the header: user experience improved and better monitoring of various column settings.
- Localization support. This doesn't mean though that the grid will provide localized text out of the box.
- jQuery no longer a dependency.
- Filtering uses the display format rather than the original field value.
- Improved pagination.
- Please give me a hand in testing it so we can make it into a nice release package. Thank you.

