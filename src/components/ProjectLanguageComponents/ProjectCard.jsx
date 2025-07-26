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

  // Helper function to get default language display info
  const getDefaultLanguageInfo = () => {
    if (!project.defaultLanguage) return null;
    
    // If defaultLanguage is populated (object with name, code, etc.)
    if (typeof project.defaultLanguage === 'object' && project.defaultLanguage.code) {
      return {
        code: project.defaultLanguage.code,
        name: project.defaultLanguage.name || project.defaultLanguage.code,
        display: `${project.defaultLanguage.name || project.defaultLanguage.code} (${project.defaultLanguage.code})`
      };
    }
    
    // If defaultLanguage is just a string (ID or code)
    if (typeof project.defaultLanguage === 'string') {
      return {
        code: project.defaultLanguage,
        name: project.defaultLanguage,
        display: project.defaultLanguage
      };
    }
    
    return null;
  };

  const defaultLangInfo = getDefaultLanguageInfo();

  // Helper function to check if a language is the default
  const isDefaultLanguage = (lang) => {
    if (!defaultLangInfo) return false;
    return lang === defaultLangInfo.code || lang === defaultLangInfo.name;
  };

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
        
        {/* Default Language Section */}
        {/* {defaultLangInfo && (
          <div className="mb-3">
            <h5 className={`text-sm font-medium ${textColor.replace('800', '700')} mb-2`}>
              Default Language
            </h5>
            <div className="flex items-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm">
                <span className="mr-1 text-green-600">★</span>
                {defaultLangInfo.display}
                <span className="ml-2 text-xs bg-green-600 text-white px-1.5 py-0.5 rounded-full">
                  DEFAULT
                </span>
              </span>
            </div>
          </div>
        )} */}
        
        {/* Languages Section */}
        <div>
          <h5 className={`text-sm font-medium ${textColor.replace('800', '700')} mb-2`}>
            Languages ({project.languages?.length || 0}
            {defaultLangInfo && (
              <span className="text-green-600 text-xs ml-1">
                • {defaultLangInfo.name} default
              </span>
            )})
          </h5>
          <div className="flex flex-wrap gap-1.5">
            {project.languages && project.languages.length > 0 ? (
              project.languages.map((lang, idx) => {
                const isDefault = isDefaultLanguage(lang);
                return (
                  <span 
                    key={idx} 
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      isDefault
                        ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 shadow-sm ring-1 ring-green-300 ring-opacity-30'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                    title={isDefault ? `${lang} (Default Language)` : lang}
                  >
                    {isDefault && (
                      <span className="mr-1 text-green-600 text-xs">★</span>
                    )}
                    {lang}
                    {isDefault && (
                      <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                  </span>
                );
              })
            ) : (
              <span className="text-gray-400 text-sm italic">No languages assigned</span>
            )}
          </div>
        </div>

        {/* Additional Project Info */}
        {/* <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              {project.createdBy && (
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  {typeof project.createdBy === 'object' ? project.createdBy.name || project.createdBy.email : 'Unknown'}
                </span>
              )}
              {project.createdAt && (
                <span className="flex items-center">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {new Date(project.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
            {defaultLangInfo && (
              <div className="flex items-center text-green-600 font-medium">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Default: {defaultLangInfo.code}
              </div>
            )}
          </div>
        </div> */}
      </div>
      
      <div className="flex items-center justify-end space-x-3">
        <button
          onClick={() => onEdit(project)}
          className={editButtonClass}
          title="Edit Project"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(project._id)}
          className={deleteButtonClass}
          title="Delete Project"
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