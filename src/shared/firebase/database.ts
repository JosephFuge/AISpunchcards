// import { firebaseConfig } from './firebaseConfig.js';
// import { initializeApp } from 'firebase/app';
// import { collection, addDoc } from 'firebase/firestore';
// import { initializeApp } from 'https://cdn.skypack.dev/firebase/app';
import { FirebaseApp } from "firebase/app";
import { AppUser, appUserConverter } from "../../models/appuser.js";
import { ClubEvent, clubEventConverter } from "../../models/clubevent";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  Firestore,
  updateDoc,
  arrayUnion,
  increment,
  setDoc,
  deleteDoc,
} from "firebase/firestore";

// Initialize Firebase

class Database {
  db: Firestore;

  constructor(app: FirebaseApp) {
    this.db = getFirestore(app);
  }

  // Function to add an event to the "events" collection
  async addEvent(event: ClubEvent) {
    try {
      // Create a new document in the "events" collection. Firestore generates a unique ID for this document.
      const docRef = await addDoc(
        collection(this.db, "events").withConverter(clubEventConverter),
        event
      );

      // Update the event object with the generated ID
      const updatedEvent = { ...event, id: docRef.id };

      // Update the document in Firestore with the new event object that includes the generated ID
      await setDoc(docRef, updatedEvent);

      // Return the updated event object or the document reference as needed
      return { ...docRef, event: updatedEvent };
    } catch (error) {
      console.error("DbError adding document: ", error);
      throw error;
    }
  }

  async fetchEvents() {
    try {
      const docsSnapshot = await getDocs(
        collection(this.db, "events").withConverter(clubEventConverter)
      );
      const docs: ClubEvent[] = [];
      docsSnapshot.forEach((doc) => {
        docs.push(doc.data());
      });
      return docs;
    } catch (error) {
      throw error;
    }
  }

  async fetchEvent(eventId: string): Promise<ClubEvent | undefined> {
    const eventRef = doc(this.db, "events", eventId).withConverter(
      clubEventConverter
    );
    const eventSnapshot = await getDoc(eventRef);

    if (!eventSnapshot.exists()) {
      console.error("Event document does not exist");
      return undefined;
    }

    // Returns undefined if no matching user is found
    const eventData = eventSnapshot.data();
    return eventData;
  }

  async deleteEvent(eventId: string): Promise<void> {
    await deleteDoc(doc(this.db, "events", eventId));
  }

  async updateEventPhotos(eventId: string, photoUrls: string[]): Promise<void> {
    try {
      const eventRef = doc(this.db, "events", eventId);
      await updateDoc(eventRef, {
        photoUrls: photoUrls,
        imgUrl: photoUrls.length > 0 ? photoUrls[0] : "" // Set first photo as main image for backward compatibility
      });
    } catch (error) {
      console.error("Error updating event photos: ", error);
      throw error;
    }
  }

  async registerAttendance(
    eventId: string,
    userId: string,
    hasPlusOne: boolean
  ) {
    const eventRef = doc(this.db, "events", eventId);

    // Construct the updates we want to make to the event. Only fields that are changing need to be included.
    let updateData;
    if (hasPlusOne) {
      updateData = {
        userAttendees: arrayUnion(userId),
        additionalAttendance: increment(1),
      };
    } else {
      updateData = {
        userAttendees: arrayUnion(userId),
      };
    }

    await updateDoc(eventRef, updateData);
  }

  async addUser(appUser: AppUser) {
    try {
      let docRef;
      if (appUser.id != null) {
        docRef = doc(this.db, "appusers", appUser.id).withConverter(
          appUserConverter
        );

        try {
          await setDoc(docRef, appUser);
        } catch (error) {
          console.error("Could not add user: ", error);
        }
      }
      // console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding user: ", error);
      throw error;
    }
  }

  async fetchUser(userId: string): Promise<AppUser | undefined> {
    console.log(`fetchuserId: ${userId}`);
    const userRef = doc(this.db, "appusers", userId).withConverter(
      appUserConverter
    );
    console.log(userRef.path);
    const userSnapshot = await getDoc(userRef);
    console.log('userSnapshot fetched: ', userSnapshot.toJSON());

    if (!userSnapshot.exists()) {
      console.error("User document does not exist");
      return undefined;
    }

    // Returns undefined if no matching user is found
    const userData = userSnapshot.data();
    return userData;
  }
}

export { Database };
