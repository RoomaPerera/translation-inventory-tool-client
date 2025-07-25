import React from 'react';

const ProjectCard = ({ 
  project, 
  onEdit, 
  onDelete,
  bgColor = 'bg-blue-50', 
  borderColor = 'border-blue-200',
  textColor = 'text-blue-800', 
  editButtonColor = 'bg-blue-600', 
  editButtonHoverColor = 'hover:bg-blue-700',
  deleteButtonColor = 'bg-red-600', 
  deleteButtonHoverColor = 'hover:bg-red-700'
}) => {
  const buttonBaseClass = `inline-flex items-center px-3 py-1.5 text-white rounded-md transition-colors text-sm font-medium`;
  const editButtonClass = `${buttonBaseClass} ${editButtonColor} ${editButtonHoverColor}`;
  const deleteButtonClass = `${buttonBaseClass} ${deleteButtonColor} ${deleteButtonHoverColor}`;

  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-6 transition-shadow hover:shadow-md`}>
      <div className="flex items-center mb-3">
        <h3 className={`text-lg font-semibold ${textColor} truncate`}>{project.name}</h3>
      </div>
      
      <div className="mb-4">
        {project.description && (
          <p className={`${textColor.replace('text-', 'text-').replace('800', '700')} mb-3 text-sm leading-relaxed`}>
            {project.description}
          </p>
        )}
        
        <div>
          <h5 className={`text-sm font-medium ${textColor.replace('800', '700')} mb-2`}>
            Languages ({project.languages?.length || 0})
          </h5>
          <div className="flex flex-wrap gap-1">
            {project.languages && project.languages.length > 0 ? (
              project.languages.map((lang, idx) => (
                <span 
                  key={idx} 
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {lang}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm italic">No languages assigned</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={() => onEdit(project)}
          className={editButtonClass}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(project._id)}
          className={deleteButtonClass}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;