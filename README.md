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
- [ ] Enable searching of events, filtering of events by category
- [ ] Add icons for event categories to help identify them visually
- [x] Enable editing of events
- [ ] Enable creating a duplicate of events
- [ ] When an event is deleted, delete the corresponding images in Firebase Storage
- [ ] Refactor folder structure naming and database interactions to be backend-agnostic (don't use "firebase" in file/folder names, in case we switch to a different backend)

