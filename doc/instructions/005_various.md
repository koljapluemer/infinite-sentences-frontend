Let's get a bunch of todos done.

For all of them, STICK TO `agents.md` and STICK TO ITS ARCHITECTURE GUIDELINES!

- establish a `settings` page, link to it from [global nav](src/app/App.vue)
- establish a `user_settings` entity, which should function as a per-user singleton
- allow on the settings page to set the *daily sentence goal* (a simple number)
- on the [stats page](src/pages/stats/StatsPage.vue), remove the tasks-per-day graphic, its useless
- for some reason, on mobile, the stats page is slightly wider than the screen, fix this.
- on the stats page, show the daily sentence goal as a dashed red line in the sentences-per-day bar chart
- make the sentences-per-day bar chart a stacked bar chart, one color per language