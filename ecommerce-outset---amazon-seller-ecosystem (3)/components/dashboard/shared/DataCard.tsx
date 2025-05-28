import React from 'react';
import { motion } from 'framer-motion';
import type { KpiCardData } from '../../../types';
import { TrendingUpIcon, TrendingDownIcon } from '../../icons';

const DataCard: React.FC<{ item: KpiCardData, index?: number }> = ({ item, index = 0 }) => {
  const IconComponent = item.icon;
  const changeColor = item.changeType === 'positive' ? 'text-green-400' : item.changeType === 'negative' ? 'text-red-400' : 'text-gray-400';
  const ChangeIcon = item.changeType === 'positive' ? TrendingUpIcon : item.changeType === 'negative' ? TrendingDownIcon : null;

  return (
    <motion.div
      className="bg-gray-800 p-5 rounded-lg shadow-lg hover:shadow-orange-500/20 transition-shadow duration-300 flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      title={item.tooltip}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-gray-400">{item.title}</h3>
        {IconComponent && <IconComponent className="w-5 h-5 text-orange-400 flex-shrink-0" />}
      </div>
      <p className="text-3xl font-bold text-white mb-1 flex-grow">{item.value}</p>
      {item.change && (
        <div className={`flex items-center text-xs ${changeColor} mt-auto pt-1`}>
          {ChangeIcon && <ChangeIcon className="w-3 h-3 mr-1"/>}
          <span>{item.change} vs last period</span>
        </div>
      )}
    </motion.div>
  );
};

export default DataCard;
