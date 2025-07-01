import React from 'react';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Breadcrumbs = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-2 text-sm"
      aria-label="Breadcrumb"
    >
      <Link
        to="/"
        className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
      >
        <FiHome className="w-4 h-4" />
        <span className="sr-only">Home</span>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <FiChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-600" />
          
          {index === items.length - 1 ? (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          ) : (
            <Link
              to={item.href}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors duration-200"
            >
              {item.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </motion.nav>
  );
};

export default Breadcrumbs;
