// CreateEventForm.tsx
import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Timestamp } from "firebase/firestore";
import { ClubEvent } from "../models/clubevent";
import { FirebaseContext } from "../shared/firebaseProvider";
import "../css/form.css";
import "../css/styles.css";

export function CreateEvent() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    imgUrl: "",
    handshakeUrl: "",
    category: "",
    eventDate: "",
    eventTime: "",
    eventDuration: "",
    // Add other fields as necessary
  });
  const [isLoading, setIsLoading] = useState(false);

  const fireContext = useContext(FirebaseContext);
  const navigate = useNavigate();

  // Update formData each time the user inputs new values into the form
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    // console.log(`Event creation name: ${name}, value: ${value}`);
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    // Construct a new ClubEvent. Convert date and time to a Firestore Timestamp if necessary
    const dateTime = Timestamp.fromDate(
      new Date(`${formData.eventDate}T${formData.eventTime}`)
    );
    const newEvent = new ClubEvent(
      null, // Assuming null ID because Firestore generates this
      formData.title,
      formData.description,
      formData.location,
      "", // imgUrl is empty, replace as necessary
      formData.handshakeUrl, // handshakeUrl is empty, replace as necessary
      formData.category, // category is empty, replace as necessary or add field in form
      dateTime,
      parseInt(formData.eventDuration),
      [], // list of user attendees is empty, will be filled as people check in
      0 // additional attendees is 0, increases as people mark that they brought a plus one
    );

    console.log(
      `Category: ${newEvent.category}, Duration: ${newEvent.eventDuration}`
    );

    try {
      await fireContext?.db.addEvent(newEvent);
      navigate('/eventCreated');
    } catch (error) {
      console.error("Error adding event: ", error);
      // Handle the error appropriately
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <title>AIS Events - Create Event</title>
      <script type="module" src="/js/createeditevent.js"></script>
      <form onSubmit={handleSubmit}>
        <h2>Create Event</h2>
        <div id="titleUnderline"></div>
        <label htmlFor="title">Event Title</label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <p>Event Category</p>
        <div className="radioSelector">
          <input
            type="radio"
            id="discoverCategory"
            name="category"
            value="Discover"
            onChange={handleChange}
            required
          ></input>
          <label htmlFor="discoverCategory">Discover</label>
          <input
            type="radio"
            id="connectCategory"
            name="category"
            value="Connect"
            onChange={handleChange}
            required
          ></input>
          <label htmlFor="connectCategory">Connect</label>
          <input
            type="radio"
            id="socializeCategory"
            name="category"
            value="Socialize"
            onChange={handleChange}
            required
          ></input>
          <label htmlFor="socializeCategory">Socialize</label>
          <input
            type="radio"
            id="learnCategory"
            name="category"
            value="Learn"
            onChange={handleChange}
            required
          ></input>
          <label htmlFor="learnCategory">Learn</label>
          <input
            type="radio"
            id="serveCategory"
            name="category"
            value="Serve"
            onChange={handleChange}
            required
          ></input>
          <label htmlFor="serveCategory">Serve</label>
        </div>

        <label htmlFor="eventDate">Event Date</label>
        <input
          type="date"
          id="eventDate"
          name="eventDate"
          value={formData.eventDate}
          onChange={handleChange}
          required
        />
        <label htmlFor="eventTime">Event Time</label>
        <input
          type="time"
          id="eventTime"
          name="eventTime"
          value={formData.eventTime}
          onChange={handleChange}
          required
        />
        <label htmlFor="eventDuration">Event Duration (in hours)</label>
        <input
          type="number"
          id="eventDuration"
          name="eventDuration"
          min="0"
          step="0.1"
          placeholder="0.5, 1, 2, etc."
          onChange={handleChange}
          required
        ></input>
        <label htmlFor="location">Event Location</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Room number, building, etc."
          required
        />
        <label htmlFor="description">Event Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Who the event is for, length of event, etc."
          required
        ></textarea>
        <input
          type="text"
          id="handshakeUrl"
          name="handshakeUrl"
          value={formData.handshakeUrl}
          onChange={handleChange}
          placeholder="Handshake URL (optional)"
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Creating...
            </>
          ) : (
            'Create Event'
          )}
        </button>
      </form>
    </div>
  );
}
