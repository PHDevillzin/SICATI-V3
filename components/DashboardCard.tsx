
import React from 'react';
import { Link } from 'react-router-dom';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  buttonColor: string;
  linkTo: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  description,
  icon,
  buttonText,
  buttonColor,
  linkTo,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col transition-transform hover:scale-105">
      <div className="p-6 flex-grow">
        <div className="flex justify-center items-center mb-4">
          <div className={`p-3 rounded-full ${buttonColor} text-white`}>
            {icon}
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 text-center">{title}</h3>
        <p className="mt-2 text-gray-500 text-center text-sm">{description}</p>
      </div>
      <div className="p-4 bg-gray-50">
        <Link
          to={linkTo}
          className={`block w-full text-center px-4 py-2 rounded-lg text-white font-semibold transition-colors ${buttonColor} hover:opacity-90`}
        >
          {buttonText}
        </Link>
      </div>
    </div>
  );
};

export default DashboardCard;
