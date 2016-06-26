Building on the work of Speros Kokenes (https://github.com/skokenes/Qlik-Sense-D3-Visualization-Library)

This d3 line chart expects a date/time field as its x-axis Dimension 

Unlike the standard Qlik line-chart, this d3 chart will display the entire data range at once - doing its best to scale the axis accordingly.

Due to the wide variety of possible date/time formats you may need to format your Dimension to meet one of the options provided in the Date/Time Format section of the Appearance panel.
If it fails to interpret the dimension an error is shown.

Note that this does not set the x-axis scale, or the axis ticks; this is done automatically by the d3 library.

Install by uncompressing the zipped folder into the Qlik Sense Extensions directory.

You should then have a 'd3 Time Line' Chart available to use in your Qlik Sense dashboards (press F5 to refresh if the App is already open)

Current (main) limitations
* Only supports 1 Dimension & 1 Measure (i.e. a single line chart)
* No interactivity - you cannot make selections in the chart
* No tooltips

Please note that this is my first published Qlik Sense Extension, and my first use of GitHub... fingers crossed it all works!

I am also not a skilled Javascript programmer - suggestions on improvements are welcome.