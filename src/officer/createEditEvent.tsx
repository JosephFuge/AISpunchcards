// CreateEventForm.tsx
import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Timestamp } from "firebase/firestore";
import { ClubEvent } from "../models/clubevent";
import { FirebaseContext } from "../shared/firebaseProvider";
import "../css/form.css";
import "../css/styles.css";

export function CreateEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const [searchParams] = useSearchParams();
  const isEditing = Boolean(eventId);
  const isDuplicating = searchParams.get('duplicate') === 'true';
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
  const [originalEvent, setOriginalEvent] = useState<ClubEvent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);

  const fireContext = useContext(FirebaseContext);
  const navigate = useNavigate();

  // Load existing event data for editing or duplication
  useEffect(() => {
    const loadEventForEditing = async () => {
      if (isEditing && eventId && fireContext) {
        const eventData = await fireContext.db.fetchEvent(eventId);
        if (eventData) {
          setOriginalEvent(eventData);
          const eventDateTime = eventData.datetime.toDate();
          const eventDate = eventDateTime.toISOString().split('T')[0];
          const eventTime = eventDateTime.toTimeString().slice(0, 5);
          
          setFormData({
            title: eventData.title,
            description: eventData.description,
            location: eventData.location,
            imgUrl: eventData.imgUrl,
            handshakeUrl: eventData.externalUrl || "",
            category: eventData.category,
            eventDate: eventDate,
            eventTime: eventTime,
            eventDuration: eventData.eventDuration.toString(),
          });
        }
      }
    };

    const loadEventForDuplication = () => {
      if (isDuplicating) {
        setFormData({
          title: searchParams.get('title') || "",
          description: searchParams.get('description') || "",
          location: searchParams.get('location') || "",
          imgUrl: "",
          handshakeUrl: searchParams.get('handshakeUrl') || "",
          category: searchParams.get('category') || "",
          eventDate: "", // Empty for duplication
          eventTime: "", // Empty for duplication
          eventDuration: searchParams.get('eventDuration') || "",
        });
      }
    };

    if (isEditing) {
      loadEventForEditing();
    } else if (isDuplicating) {
      loadEventForDuplication();
    }
  }, [isEditing, isDuplicating, eventId, fireContext, searchParams]);

  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Clean up previous preview URLs
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      
      // Create new preview URLs
      const newPreviewUrls = filesArray.map(file => URL.createObjectURL(file));
      
      setSelectedFiles(filesArray);
      setPreviewUrls(newPreviewUrls);
    }
  };

  const removeFile = (indexToRemove: number) => {
    // Revoke the URL for the file being removed
    if (previewUrls[indexToRemove]) {
      URL.revokeObjectURL(previewUrls[indexToRemove]);
    }
    
    setSelectedFiles(files => files.filter((_, index) => index !== indexToRemove));
    setPreviewUrls(urls => urls.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      // Construct a new ClubEvent. Convert date and time to a Firestore Timestamp if necessary
      const dateTime = Timestamp.fromDate(
        new Date(`${formData.eventDate}T${formData.eventTime}`)
      );
      
      if (isEditing && eventId && originalEvent) {
        // Update existing event
        const updatedEvent = new ClubEvent(
          eventId,
          formData.title,
          formData.description,
          formData.location,
          originalEvent.imgUrl, // Keep existing imgUrl
          originalEvent.photoUrls, // Keep existing photoUrls for now
          formData.handshakeUrl,
          formData.category,
          dateTime,
          parseInt(formData.eventDuration),
          originalEvent.userAttendees, // Keep existing attendees
          originalEvent.additionalAttendance // Keep existing additional attendees
        );

        await fireContext?.db.updateEvent(eventId, updatedEvent);

        // If there are new photos to upload
        if (selectedFiles.length > 0 && fireContext?.fileStorage) {
          setIsUploadingPhotos(true);
          
          // Upload new photos to Firebase Storage
          const photoUrls = await fireContext.fileStorage.uploadMultipleEventPhotos(eventId, selectedFiles);
          
          // Combine existing and new photo URLs
          const allPhotoUrls = [...originalEvent.photoUrls, ...photoUrls];
          
          // Update the event document with all photo URLs
          await fireContext.db.updateEventPhotos(eventId, allPhotoUrls);
        }

        navigate(`/viewEvent/${eventId}`);
      } else {
        // Create new event
        const newEvent = new ClubEvent(
          null, // Assuming null ID because Firestore generates this
          formData.title,
          formData.description,
          formData.location,
          "", // imgUrl will be set after photo upload
          [], // photoUrls will be set after photo upload
          formData.handshakeUrl,
          formData.category,
          dateTime,
          parseInt(formData.eventDuration),
          [], // list of user attendees is empty, will be filled as people check in
          0 // additional attendees is 0, increases as people mark that they brought a plus one
        );

        console.log(
          `Category: ${newEvent.category}, Duration: ${newEvent.eventDuration}`
        );

        // First, add the event to get the event ID
        const result = await fireContext?.db.addEvent(newEvent);
        const newEventId = result?.event.id;

        // If there are photos to upload and we have an event ID
        if (selectedFiles.length > 0 && newEventId && fireContext?.fileStorage) {
          setIsUploadingPhotos(true);
          
          // Upload photos to Firebase Storage
          const photoUrls = await fireContext.fileStorage.uploadMultipleEventPhotos(newEventId, selectedFiles);
          
          // Update the event document with photo URLs
          await fireContext.db.updateEventPhotos(newEventId, photoUrls);
        }

        navigate('/eventCreated');
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} event: `, error);
      // Handle the error appropriately
    } finally {
      setIsLoading(false);
      setIsUploadingPhotos(false);
    }
  };

  return (
    <div>
      <title>AIS Events - Create Event</title>
      <script type="module" src="/js/createeditevent.js"></script>
      <form onSubmit={handleSubmit}>
        <h2>{isEditing ? 'Edit Event' : (isDuplicating ? 'Duplicate Event' : 'Create Event')}</h2>
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
            checked={formData.category === "Discover"}
            onChange={handleChange}
            required
          ></input>
          <label htmlFor="discoverCategory">Discover</label>
          <input
            type="radio"
            id="connectCategory"
            name="category"
            value="Connect"
            checked={formData.category === "Connect"}
            onChange={handleChange}
            required
          ></input>
          <label htmlFor="connectCategory">Connect</label>
          <input
            type="radio"
            id="socializeCategory"
            name="category"
            value="Socialize"
            checked={formData.category === "Socialize"}
            onChange={handleChange}
            required
          ></input>
          <label htmlFor="socializeCategory">Socialize</label>
          <input
            type="radio"
            id="learnCategory"
            name="category"
            value="Learn"
            checked={formData.category === "Learn"}
            onChange={handleChange}
            required
          ></input>
          <label htmlFor="learnCategory">Learn</label>
          <input
            type="radio"
            id="serveCategory"
            name="category"
            value="Serve"
            checked={formData.category === "Serve"}
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
          value={formData.eventDuration}
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
        
        <label htmlFor="eventPhotos">Event Photos (optional)</label>
        <input
          type="file"
          id="eventPhotos"
          name="eventPhotos"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="file-input"
        />
        
        {selectedFiles.length > 0 && (
          <div className="selected-files">
            <p>Selected photos:</p>
            <div className="image-previews">
              {selectedFiles.map((file, index) => (
                <div key={index} className="image-preview-item">
                  <div className="image-preview-container">
                    <img 
                      src={previewUrls[index]} 
                      alt={`Preview ${index + 1}`}
                      className="image-preview"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="remove-image-btn"
                    >
                      ✕
                    </button>
                  </div>
                  <span className="file-name">{file.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <button type="submit" disabled={isLoading || isUploadingPhotos}>
          {isLoading ? (
            <>
              <span className="spinner"></span>
              {isUploadingPhotos ? 'Uploading Photos...' : (isEditing ? 'Updating...' : 'Creating...')}
            </>
          ) : (
            isEditing ? 'Update Event' : 'Create Event'
          )}
        </button>
      </form>
    </div>
  );
}
