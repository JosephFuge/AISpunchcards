// CreateEventForm.js
import { useTranslation } from "react-i18next";
import React, { useState } from "react";
import { Timestamp } from "firebase/firestore"; // Import Timestamp from Firestore
import { Database } from "/path/to/js/firebase/database"; // Adjust the import path as necessary
import { ClubEvent } from "/path/to/js/models/clubevent"; // Adjust the import path as necessary

function CreateEvent() {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    eventTitle: "",
    eventDate: "",
    eventTime: "",
    eventLocation: "",
    eventDescription: "",
    // Add other fields as necessary
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const db = new Database(); // Initialize your database class
    // Construct a new ClubEvent. Convert date and time to a Firestore Timestamp if necessary
    const dateTime = Timestamp.fromDate(new Date(`${formData.eventDate}T${formData.eventTime}`));
    const newEvent = new ClubEvent(
      null, // Assuming null ID because Firestore generates this
      formData.eventTitle,
      formData.eventDescription,
      formData.eventLocation,
      "", // imgUrl is empty, replace as necessary
      "", // handshakeUrl is empty, replace as necessary
      "", // category is empty, replace as necessary or add field in form
      dateTime
    );

    try {
      const docRef = await db.addEvent(newEvent);
      console.log(`Event added with ID: ${docRef.id}`);
      // Here you can clear the form or redirect the user
    } catch (error) {
      console.error("Error adding event: ", error);
      // Handle the error appropriately
    }
  };

  return (
    <div>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{t("ais_events__create_event")}</title>
      <script type="module" src="/js/createeditevent.js"></script>
      <form onSubmit={handleSubmit}>
        <h2>{t("create_event")}</h2>
        <div id="titleUnderline"></div>
        <label htmlFor="eventTitle">{t("event_title")}</label>
        <input
          type="text"
          id="eventTitle"
          name="eventTitle"
          value={formData.eventTitle}
          onChange={handleChange}
          required
        />
        <label htmlFor="eventDate">{t("event_date")}</label>
        <input
          type="date"
          id="eventDate"
          name="eventDate"
          value={formData.eventDate}
          onChange={handleChange}
          required
        />
        <label htmlFor="eventTime">{t("event_time")}</label>
        <input
          type="time"
          id="eventTime"
          name="eventTime"
          value={formData.eventTime}
          onChange={handleChange}
          required
        />
        <label htmlFor="eventLocation">{t("event_location")}</label>
        <input
          type="text"
          id="eventLocation"
          name="eventLocation"
          value={formData.eventLocation}
          onChange={handleChange}
          placeholder={t("room_number_building_etc")}
          required
        />
        <label htmlFor="eventDescription">{t("event_description")}</label>
        <textarea
          id="eventDescription"
          name="eventDescription"
          value={formData.eventDescription}
          onChange={handleChange}
          placeholder={t("who_the_event_is_for_length_of_event_etc")}
          required
        ></textarea>
        <button type="submit">{t("create_event")}</button>
      </form>
    </div>
  );
}

export default CreateEvent;
