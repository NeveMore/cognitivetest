stroop
======

Mobile Web App Implementation of the Stroop Test

What is a Stroop Test? It's a method for measuring the Stroop Effect, essentially cognitive load. See
this [Wikipedia article on the Stroop Effect](http://en.wikipedia.org/wiki/Stroop_effect)
for more information, or use Your Friend Google / Bing / DuckDuckGo.

This is a quick and dirty implementation of the Stroop Test designed to run as a web app on iOS and other
mobile devices. 

Usage
-----

Simply deploy it on a web server and then bookmark it to create a standalone web app. All data are stored locally
on the device and can be retrieved via copy and paste.

Data are output in JSON format (it's a little ugly -- it's one object per trial, but not output as an array).

A tool for converting the data into text suitable for import into SPSS, SASS, or similar is also provided in the
data subdirectory.

You can see all this working at http://doodlegames.com/stroop, and http://doodlegames.com/stroop/data.

To Do
-----

Yes, it would be trivial to integrate the data-processing component into the main app, I just haven't done it yet.
