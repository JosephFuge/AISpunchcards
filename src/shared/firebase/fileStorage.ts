import { FirebaseApp } from "firebase/app";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  FirebaseStorage,
} from "firebase/storage";

class FileStorage {
  storage: FirebaseStorage;

  constructor(app: FirebaseApp) {
    // Initialize Firebase Storage - uses the bucket from firebaseConfig
    this.storage = getStorage(app);
  }

  async uploadEventPhoto(eventId: string, file: File): Promise<string> {
    try {
      console.log('Starting upload for eventId:', eventId, 'file:', file.name, 'size:', file.size);

      // Validate inputs
      if (!eventId) {
        throw new Error('Event ID is required');
      }
      if (!file) {
        throw new Error('File is required');
      }

      // Create a unique filename using timestamp and original filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      const fileName = `${timestamp}_${file.name}`;

      const filePath = `events/${eventId}/photos/${fileName}`;
      console.log('Generated filename and file path:', fileName, filePath);

      // Create a reference to the file location in Firebase Storage
      const storageRef = ref(this.storage, filePath);

      console.log('Storage reference created. Full path:', storageRef.fullPath);
      console.log('Storage bucket:', storageRef.bucket);

      console.log('About to call uploadBytes...');
      // Upload the file with a timeout
      const uploadPromise = uploadBytes(storageRef, file);
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Upload timeout after 30 seconds')), 30000);
      });

      const snapshot = await Promise.race([uploadPromise, timeoutPromise]);

      console.log('Upload completed! Snapshot:', snapshot);
      console.log('Image path after upload:', snapshot.ref.fullPath);

      console.log('Getting download URL...');
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);

      console.log('File uploaded successfully. Download URL:', downloadURL);
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        serverResponse: error.serverResponse
      });
      throw error;
    }
  }

  async uploadMultipleEventPhotos(eventId: string, files: File[]): Promise<string[]> {
    try {
      const uploadPromises = files.map(file => this.uploadEventPhoto(eventId, file));
      const downloadURLs = await Promise.all(uploadPromises);
      return downloadURLs;
    } catch (error) {
      console.error('Error uploading multiple files:', error);
      throw error;
    }
  }

  async deleteEventPhoto(photoUrl: string): Promise<void> {
    try {
      // Create a reference from the URL
      const storageRef = ref(this.storage, photoUrl);

      // Delete the file
      await deleteObject(storageRef);

      console.log('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }

  async deleteEventPhotos(photoUrls: string[]): Promise<void> {
    try {
      const deletePromises = photoUrls.map(url => this.deleteEventPhoto(url));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting multiple files:', error);
      throw error;
    }
  }
}

export { FileStorage };
