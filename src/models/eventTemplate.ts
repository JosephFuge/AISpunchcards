import {
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";

class EventTemplate {
  id: string | null;
  name: string = ""; // Template name for identification
  title?: string;
  description?: string;
  location?: string;
  imgUrl?: string;
  photoUrls?: string[];
  externalUrl?: string;
  category?: string;
  eventDuration?: number; // In hours
  additionalAttendance?: number;

  constructor(
    tempId: string | null,
    tempName: string,
    tempTitle?: string,
    tempDescription?: string,
    tempLocation?: string,
    tempImgUrl?: string,
    tempPhotoUrls?: string[],
    tempExternalUrl?: string,
    tempCategory?: string,
    tempEventDuration?: number,
    tempAdditionalAttendance?: number
  ) {
    this.id = tempId;
    this.name = tempName;
    this.title = tempTitle;
    this.description = tempDescription;
    this.location = tempLocation;
    this.imgUrl = tempImgUrl;
    this.photoUrls = tempPhotoUrls;
    this.externalUrl = tempExternalUrl;
    this.category = tempCategory;
    this.eventDuration = tempEventDuration;
    this.additionalAttendance = tempAdditionalAttendance;
  }

  // Helper method to create a ClubEvent from this template
  toClubEventData() {
    return {
      title: this.title || "",
      description: this.description || "",
      location: this.location || "",
      imgUrl: this.imgUrl || "",
      photoUrls: this.photoUrls || [],
      externalUrl: this.externalUrl || "",
      category: this.category || "",
      eventDuration: this.eventDuration || 1,
      additionalAttendance: this.additionalAttendance || 0,
    };
  }
}

const eventTemplateConverter = {
  toFirestore: (template: EventTemplate) => {
    const data: any = {
      id: template.id,
      name: template.name,
    };

    // Only include optional fields if they have values
    if (template.title !== undefined) data.title = template.title;
    if (template.description !== undefined) data.description = template.description;
    if (template.location !== undefined) data.location = template.location;
    if (template.imgUrl !== undefined) data.imgUrl = template.imgUrl;
    if (template.photoUrls !== undefined) data.photoUrls = template.photoUrls;
    if (template.externalUrl !== undefined) data.externalUrl = template.externalUrl;
    if (template.category !== undefined) data.category = template.category;
    if (template.eventDuration !== undefined) data.eventDuration = template.eventDuration;
    if (template.additionalAttendance !== undefined) data.additionalAttendance = template.additionalAttendance;

    return data;
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot<DocumentData>,
    options: SnapshotOptions
  ) => {
    const data = snapshot.data(options);
    return new EventTemplate(
      data.id,
      data.name,
      data.title,
      data.description,
      data.location,
      data.imgUrl,
      data.photoUrls,
      data.externalUrl,
      data.category,
      data.eventDuration,
      data.additionalAttendance
    );
  },
};

export { EventTemplate, eventTemplateConverter };