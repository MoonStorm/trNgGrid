### trNgGrid is a feature rich data grid based on the popular AngularJs framework and making use of plain HTML table elements.

#### [Documentation and demo site](http://moonstorm.github.io/trNgGrid/release)

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
You can download the grid from the `release` folder in the master branch. Make sure you also include Angular and a Boostrap theme of your choice. Themes can be found on the Bootswatch website. Of course you can craft your own, as the grid layout is quite easy to style.

##### Legend
- master/release : stable
- gh-pages: DEMO site
- dev: broken in a million pieces


##### Issues
 Feel free to post any problems you might experience in the `issues` section, but before you do that, fork [this simple example](http://jsfiddle.net/MoonStorm/pkuca2f8/) and attempt to isolate the issue.
 
*Update: I'm in the process of moving house across an ocean so please excuse my silence for a short while. Many people are using this grid, so I'm sure you'll find the help you need.*


##### Change Log

###### 3.0.4
- The initial order of items is now maintained
- An initial order-by is now working even if it was set prior to binding the list of items 
- Sorting now works even when the text inside the column header is clicked in IE9
- The page index now resets in case one of the column filters, the general filter, or the sort column is changed in server-side mode

###### 3.0.3
- The number of items per page are being properly monitored.

###### 3.0.2
- Fixed a major data binding issue. External scope wasn't getting synchronized with any changes inside the grid's internal scope.
- Fixed a bug where the grid would error if the bound items array was not initialized.
- Fixed the direction of the sorting chevrons.
- Selection with the SHIFT key when sorting was applied is now working correctly.

###### 3.0.0
- Multiple types of selection.
- Ability to override the default CSS and templates.
- Better handling of various elements in the header: user experience improved and better monitoring of various column settings.
- Localization support. This doesn't mean though that the grid will provide localized text out of the box.
- jQuery no longer a dependency.
- Filtering uses the display format rather than the original field value.
- Improved pagination.
