import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { PollingStatus } from '../enums/PollingStatus';
import './ProgressBar.css';

export const ProgressBar: React.FC = () => {
  const context = useContext(AppContext);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    let timeoutId: number = 0;
    if (context.dataPollingStatus === PollingStatus.Fetching) {
      setVisible(true);
    } else if (visible) {
      timeoutId = window.setTimeout(() => {
        setVisible(false);
      }, 1000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [context.dataPollingStatus, visible]);


  return visible
    ? <div className="progress-bar"/>
    : null;
};
