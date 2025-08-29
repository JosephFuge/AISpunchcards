import React, { useContext, useEffect, useState } from "react";
import { EventTemplate } from "../models/eventTemplate";
import { FirebaseContext } from "../shared/firebaseProvider";
import { Compass, Link as LinkIcon, Users, GraduationCap, Heart, Plus, Pencil, Trash } from "phosphor-react";

export function TemplateManagement() {
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EventTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    description: "",
    location: "",
    imgUrl: "",
    externalUrl: "",
    category: "",
    eventDuration: "",
    additionalAttendance: "",
  });

  const fireContext = useContext(FirebaseContext);

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case "Discover":
        return <Compass size={16} />;
      case "Connect":
        return <LinkIcon size={16} />;
      case "Socialize":
        return <Users size={16} />;
      case "Learn":
        return <GraduationCap size={16} />;
      case "Serve":
        return <Heart size={16} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [fireContext?.db]);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      const templateList = await fireContext?.db.fetchEventTemplates();
      if (templateList) {
        setTemplates(templateList);
      }
    } catch (error) {
      console.error("Error fetching templates: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      title: "",
      description: "",
      location: "",
      imgUrl: "",
      externalUrl: "",
      category: "",
      eventDuration: "",
      additionalAttendance: "",
    });
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const startCreating = () => {
    resetForm();
    setIsCreating(true);
  };

  const startEditing = (template: EventTemplate) => {
    setFormData({
      name: template.name,
      title: template.title || "",
      description: template.description || "",
      location: template.location || "",
      imgUrl: template.imgUrl || "",
      externalUrl: template.externalUrl || "",
      category: template.category || "",
      eventDuration: template.eventDuration?.toString() || "",
      additionalAttendance: template.additionalAttendance?.toString() || "",
    });
    setEditingTemplate(template);
    setIsCreating(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fireContext?.db) return;

    try {
      const templateData = new EventTemplate(
        editingTemplate?.id || null,
        formData.name,
        formData.title || undefined,
        formData.description || undefined,
        formData.location || undefined,
        formData.imgUrl || undefined,
        undefined, // photoUrls - not needed for templates
        formData.externalUrl || undefined,
        formData.category || undefined,
        formData.eventDuration ? parseInt(formData.eventDuration) : undefined,
        formData.additionalAttendance ? parseInt(formData.additionalAttendance) : undefined
      );

      if (editingTemplate) {
        await fireContext.db.updateEventTemplate(editingTemplate.id!, templateData);
      } else {
        await fireContext.db.addEventTemplate(templateData);
      }

      await fetchTemplates();
      resetForm();
    } catch (error) {
      console.error("Error saving template: ", error);
      alert("Error saving template. Please try again.");
    }
  };

  const handleDelete = async (template: EventTemplate) => {
    if (!fireContext?.db || !template.id) return;

    if (window.confirm(`Are you sure you want to delete the template "${template.name}"?`)) {
      try {
        await fireContext.db.deleteEventTemplate(template.id);
        await fetchTemplates();
      } catch (error) {
        console.error("Error deleting template: ", error);
        alert("Error deleting template. Please try again.");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="template-management">
        <h2>Loading Templates...</h2>
      </div>
    );
  }

  return (
    <div className="template-management">
      <div className="template-header">
        <h2>Event Templates</h2>
        <button 
          className="btn btn-primary"
          onClick={startCreating}
          disabled={isCreating || editingTemplate}
        >
          <Plus size={20} />
          Create Template
        </button>
      </div>

      {(isCreating || editingTemplate) && (
        <div className="template-form-container">
          <form onSubmit={handleSubmit} className="template-form">
            <h3>{editingTemplate ? 'Edit Template' : 'Create New Template'}</h3>
            
            <div className="form-group">
              <label htmlFor="name">Template Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Monthly Speaker Series"
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">Event Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Leave empty if varies per event"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category...</option>
                <option value="Discover">Discover</option>
                <option value="Connect">Connect</option>
                <option value="Socialize">Socialize</option>
                <option value="Learn">Learn</option>
                <option value="Serve">Serve</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Tanner Building 1040"
              />
            </div>

            <div className="form-group">
              <label htmlFor="eventDuration">Duration (hours)</label>
              <input
                type="number"
                id="eventDuration"
                name="eventDuration"
                value={formData.eventDuration}
                onChange={handleChange}
                min="0.5"
                step="0.5"
                placeholder="e.g., 1.5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Template description or common event description"
              />
            </div>

            <div className="form-group">
              <label htmlFor="externalUrl">External URL</label>
              <input
                type="url"
                id="externalUrl"
                name="externalUrl"
                value={formData.externalUrl}
                onChange={handleChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="imgUrl">Image URL</label>
              <input
                type="url"
                id="imgUrl"
                name="imgUrl"
                value={formData.imgUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-success">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="templates-list">
        {templates.length === 0 ? (
          <p className="no-templates">No templates created yet.</p>
        ) : (
          templates.map(template => (
            <div key={template.id} className="template-card">
              <div className="template-card-header">
                <div className="template-info">
                  {template.category && getCategoryIcon(template.category)}
                  <h4>{template.name}</h4>
                </div>
                <div className="template-actions">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => startEditing(template)}
                    disabled={isCreating || editingTemplate}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className="btn btn-outline-danger btn-sm"
                    onClick={() => handleDelete(template)}
                    disabled={isCreating || editingTemplate}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>
              <div className="template-card-content">
                {template.title && <p><strong>Title:</strong> {template.title}</p>}
                {template.category && <p><strong>Category:</strong> {template.category}</p>}
                {template.location && <p><strong>Location:</strong> {template.location}</p>}
                {template.eventDuration && <p><strong>Duration:</strong> {template.eventDuration} hours</p>}
                {template.description && (
                  <p><strong>Description:</strong> {template.description.length > 150 
                    ? `${template.description.substring(0, 150)}...` 
                    : template.description}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}