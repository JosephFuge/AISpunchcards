import React, { useContext, useEffect, useState } from "react";
import { EventTemplate } from "../models/eventTemplate";
import { FirebaseContext } from "../shared/firebaseProvider";
import { Compass, Link as LinkIcon, Users, GraduationCap, Heart } from "phosphor-react";

interface TemplateSelectorProps {
  onTemplateSelect: (template: EventTemplate | null) => void;
  selectedTemplate: EventTemplate | null;
}

export function TemplateSelector({ onTemplateSelect, selectedTemplate }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
    const fetchTemplates = async () => {
      try {
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

    fetchTemplates();
  }, [fireContext?.db]);

  if (isLoading) {
    return (
      <div className="template-selector">
        <h3>Loading templates...</h3>
      </div>
    );
  }

  return (
    <div className="template-selector">
      <h3>Choose a Template (Optional)</h3>
      <div className="template-options">
        <div
          className={`template-option ${selectedTemplate === null ? "selected" : ""}`}
          onClick={() => onTemplateSelect(null)}
        >
          <div className="template-header">
            <h4>Start from Scratch</h4>
          </div>
          <p>Create a new event with blank fields</p>
        </div>

        {templates.map((template) => (
          <div
            key={template.id}
            className={`template-option ${selectedTemplate?.id === template.id ? "selected" : ""}`}
            onClick={() => onTemplateSelect(template)}
          >
            <div className="template-header">
              <div className="template-title">
                {template.category && getCategoryIcon(template.category)}
                <h4>{template.name}</h4>
              </div>
            </div>
            <div className="template-preview">
              {template.title && <p><strong>Title:</strong> {template.title}</p>}
              {template.category && <p><strong>Category:</strong> {template.category}</p>}
              {template.location && <p><strong>Location:</strong> {template.location}</p>}
              {template.eventDuration && <p><strong>Duration:</strong> {template.eventDuration} hours</p>}
              {template.description && (
                <p><strong>Description:</strong> {template.description.length > 100 
                  ? `${template.description.substring(0, 100)}...` 
                  : template.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <p className="no-templates">No templates available. Create your first template from the event management page.</p>
      )}
    </div>
  );
}