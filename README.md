# AIS Punchcard App

## Setup Instructions

Clone repo

Run "npm ci"

Run "npm start"

If "npm start" doesn't work, send us your gmail and we will add you to the Firebase project.

Then, you can run:
firebase login (login with matching gmail)

firebase serve

To add an admin:

Once you have been added as an editor on the Firebase project,

1. Go to console.firebase.google.com
2. Click "go to console"
3. Click "AISPunchCard"
4. Click "Build" dropdown on the left
5. Click "Firestore"
6. Click "appusers" collection
7. Assuming you have already logged in and created a user, find the user
8. Set "isOfficer" to true

## TODO
- [ ] Add a home page explaining the site (Right now it's just a login button)
- [ ] Add filtering of events by time (next week, month, year)
- [ ] Enable users to download .ics files to add events to their calendar
    - Consider hooking up to a Google Calendar API or something else so that, if events are created in the AIS calendar, they are created in this website. Likewise, the event is updated in the users' calendar automatically. Not sure how feasible this is.
- [ ] Add further tagging of events beyond category - i.e. IS Academy, Tech Night, Sponsorships. This would be more relevant and helpful than the vague "Learn", "Social", "Discover", etc. categories
- [ ] When an event is deleted, delete the corresponding images in Firebase Storage (careful that duplicated events with the same photo URLs don't exist before deleting)
- [ ] Refactor folder structure naming and database interactions to be backend-agnostic (don't use "firebase" in file/folder names, in case we switch to a different backend)
- [ ] Allow users to filter for events that they have marked as "attending"
- [ ] Redirect user to their original destination after logging in (currently it defaults to event list page)
- [ ] Enable searching of events by title and description
- [x] ~Enable filtering of events by category~
- [x] ~Add icons for event categories to help identify them visually~
- [x] ~Enable editing of events~
- [x] ~Enable creating a duplicate of events~
